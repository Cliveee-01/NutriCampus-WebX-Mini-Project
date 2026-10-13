import { useState, useEffect } from 'react';
import { MealItem } from '../types';

export interface CartItem {
  mealId: string;
  name: string;
  price: number;
  period: 'breakfast' | 'lunch' | 'dinner';
  imageUrl: string;
  dietaryTags: string[];
  quantity: number;
}

type CartListener = () => void;

class CartStore {
  private items: CartItem[] = [];
  private listeners: Set<CartListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = sessionStorage.getItem('nutricampus_cart_v1');
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch {
      this.items = [];
    }
  }

  private saveToStorage() {
    try {
      sessionStorage.setItem('nutricampus_cart_v1', JSON.stringify(this.items));
    } catch {
      // ignore
    }
  }

  public subscribe(listener: CartListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Cart listener error:', err);
      }
    });
  }

  public getItems(): CartItem[] {
    return this.items;
  }

  public getTotalItemsCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  public getSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  public addItem(meal: MealItem, quantity: number = 1) {
    if (!meal.isAvailable) return;
    const qtyToAdd = Math.max(1, Math.min(20, quantity));

    const existingIndex = this.items.findIndex((i) => i.mealId === meal.id);
    if (existingIndex >= 0) {
      const newQty = Math.min(20, this.items[existingIndex].quantity + qtyToAdd);
      this.items[existingIndex].quantity = newQty;
    } else {
      this.items.push({
        mealId: meal.id,
        name: meal.name,
        price: meal.price,
        period: meal.period,
        imageUrl: meal.imageUrl,
        dietaryTags: meal.dietaryTags,
        quantity: qtyToAdd,
      });
    }

    this.notify();
  }

  public updateQuantity(mealId: string, quantity: number) {
    const existingIndex = this.items.findIndex((i) => i.mealId === mealId);
    if (existingIndex >= 0) {
      if (quantity <= 0) {
        this.items.splice(existingIndex, 1);
      } else {
        this.items[existingIndex].quantity = Math.min(20, quantity);
      }
      this.notify();
    }
  }

  public increment(mealId: string) {
    const existing = this.items.find((i) => i.mealId === mealId);
    if (existing && existing.quantity < 20) {
      existing.quantity += 1;
      this.notify();
    }
  }

  public decrement(mealId: string) {
    const existingIndex = this.items.findIndex((i) => i.mealId === mealId);
    if (existingIndex >= 0) {
      if (this.items[existingIndex].quantity > 1) {
        this.items[existingIndex].quantity -= 1;
      } else {
        this.items.splice(existingIndex, 1);
      }
      this.notify();
    }
  }

  public removeItem(mealId: string) {
    this.items = this.items.filter((i) => i.mealId !== mealId);
    this.notify();
  }

  public clearCart() {
    this.items = [];
    this.notify();
  }
}

export const cartStore = new CartStore();

export function useCartStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return cartStore;
}
