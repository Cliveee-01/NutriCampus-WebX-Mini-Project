import {
  MealItem,
  MealPeriod,
  MealRsvp,
  RsvpStatus,
  SurplusOffer,
  SurplusClaim,
  UserProfile,
  CalculatedIngredient,
  DailySustainabilityStats,
} from '../types';
import {
  INITIAL_MEALS,
  INITIAL_SURPLUS_OFFERS,
  INITIAL_USERS,
  HISTORICAL_ANALYTICS,
} from '../data/seedData';

const STORAGE_KEYS = {
  CURRENT_USER: 'nutricampus_current_user_v1',
  USERS: 'nutricampus_users_v1',
  MEALS: 'nutricampus_meals_v1',
  RSVPS: 'nutricampus_rsvps_v1',
  AGGREGATES: 'nutricampus_aggregates_v1',
  SURPLUS_OFFERS: 'nutricampus_surplus_offers_v1',
  SURPLUS_CLAIMS: 'nutricampus_surplus_claims_v1',
  PLANNED_BUFFERS: 'nutricampus_buffers_v1',
  BYPASS_CUTOFF: 'nutricampus_bypass_cutoff_v1',
};

// Today's date string YYYY-MM-DD
export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

interface BaseAggregates {
  breakfast: { attending: number; notAttending: number; total: number; cutoff: string };
  lunch: { attending: number; notAttending: number; total: number; cutoff: string };
  dinner: { attending: number; notAttending: number; total: number; cutoff: string };
}

const DEFAULT_AGGREGATES: BaseAggregates = {
  breakfast: { attending: 284, notAttending: 42, total: 350, cutoff: '06:30 AM' },
  lunch: { attending: 326, notAttending: 18, total: 350, cutoff: '10:30 AM' },
  dinner: { attending: 215, notAttending: 78, total: 350, cutoff: '05:30 PM' },
};

type Listener = () => void;

class NutriCampusStore {
  private listeners: Set<Listener> = new Set();
  private currentUser: UserProfile;
  private users: UserProfile[];
  private meals: MealItem[];
  private rsvps: MealRsvp[];
  private aggregates: BaseAggregates;
  private surplusOffers: SurplusOffer[];
  private surplusClaims: SurplusClaim[];
  private plannedBuffers: Record<MealPeriod, number>; // extra portions over expected
  private bypassCutoff: boolean;

  constructor() {
    this.users = this.loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUser = this.loadFromStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    this.meals = this.loadFromStorage(STORAGE_KEYS.MEALS, INITIAL_MEALS);
    this.aggregates = this.loadFromStorage(STORAGE_KEYS.AGGREGATES, DEFAULT_AGGREGATES);
    this.surplusOffers = this.loadFromStorage(STORAGE_KEYS.SURPLUS_OFFERS, INITIAL_SURPLUS_OFFERS);
    this.surplusClaims = this.loadFromStorage(STORAGE_KEYS.SURPLUS_CLAIMS, [
      {
        id: 'claim-seed-1',
        offerId: 'surplus-1',
        offerMealName: 'Paneer Butter Masala & 4 Fresh Phulkas Combo',
        userId: 'student-2',
        studentName: INITIAL_USERS[1]?.name || 'Leon Dsouza',
        studentId: INITIAL_USERS[1]?.studentId || '2023-EC-048',
        claimedAt: new Date(Date.now() - 3600000).toISOString(),
        claimCode: 'NC-4192',
        status: 'claimed',
        pricePaid: 35,
        pickupDeadline: '3:30 PM',
        pickupLocation: 'Counter 2 (Surplus Redistribution Bay), Ground Floor Canteen',
      },
    ]);
    this.rsvps = this.loadFromStorage(STORAGE_KEYS.RSVPS, [
      {
        id: `student-1_breakfast_${getTodayDateString()}`,
        userId: 'student-1',
        studentName: INITIAL_USERS[0]?.name || 'Jaden Dsouza',
        studentId: INITIAL_USERS[0]?.studentId || '2023-CS-104',
        date: getTodayDateString(),
        period: 'breakfast',
        status: 'attending',
        updatedAt: new Date().toISOString(),
      },
      {
        id: `student-1_lunch_${getTodayDateString()}`,
        userId: 'student-1',
        studentName: INITIAL_USERS[0]?.name || 'Jaden Dsouza',
        studentId: INITIAL_USERS[0]?.studentId || '2023-CS-104',
        date: getTodayDateString(),
        period: 'lunch',
        status: 'attending',
        updatedAt: new Date().toISOString(),
      },
      {
        id: `student-1_dinner_${getTodayDateString()}`,
        userId: 'student-1',
        studentName: INITIAL_USERS[0]?.name || 'Jaden Dsouza',
        studentId: INITIAL_USERS[0]?.studentId || '2023-CS-104',
        date: getTodayDateString(),
        period: 'dinner',
        status: 'not_attending',
        updatedAt: new Date().toISOString(),
      },
    ]);
    this.plannedBuffers = this.loadFromStorage(STORAGE_KEYS.PLANNED_BUFFERS, {
      breakfast: 15,
      lunch: 20,
      dinner: 15,
    });
    this.bypassCutoff = this.loadFromStorage(STORAGE_KEYS.BYPASS_CUTOFF, true); // true by default for smooth demo presentation
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  }

  // USER / AUTH MANAGEMENT
  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public getAllUsers(): UserProfile[] {
    return this.users;
  }

  public switchUser(userId: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notify();
    }
  }

  public updateProfileDietary(
    preferences: UserProfile['dietaryPreferences'],
    allergies?: string[]
  ): void {
    this.currentUser.dietaryPreferences = { ...preferences };
    if (allergies !== undefined) {
      this.currentUser.allergies = allergies;
    }
    // Update in users list too
    this.users = this.users.map((u) => (u.id === this.currentUser.id ? { ...this.currentUser } : u));
    this.saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  // CUTOFF CONFIGURATION
  public getBypassCutoff(): boolean {
    return this.bypassCutoff;
  }

  public toggleBypassCutoff(bypass: boolean): void {
    this.bypassCutoff = bypass;
    this.saveToStorage(STORAGE_KEYS.BYPASS_CUTOFF, this.bypassCutoff);
    this.notify();
  }

  public isCutoffPassed(period: MealPeriod): boolean {
    if (this.bypassCutoff) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    // Breakfast cutoff: 6:30 AM (390 mins)
    // Lunch cutoff: 10:30 AM (630 mins)
    // Dinner cutoff: 5:30 PM (1050 mins)
    const cutoffs = {
      breakfast: 6 * 60 + 30,
      lunch: 10 * 60 + 30,
      dinner: 17 * 60 + 30,
    };
    return currentTimeVal > cutoffs[period];
  }

  // MEALS
  public getMeals(period?: MealPeriod): MealItem[] {
    if (period) {
      return this.meals.filter((m) => m.period === period);
    }
    return this.meals;
  }

  public updateMealRecipe(mealId: string, recipe: MealItem['recipe']): void {
    this.meals = this.meals.map((m) => (m.id === mealId ? { ...m, recipe } : m));
    this.saveToStorage(STORAGE_KEYS.MEALS, this.meals);
    this.notify();
  }

  // RSVPs
  public getStudentRsvp(period: MealPeriod, date: string = getTodayDateString()): RsvpStatus | null {
    const compoundId = `${this.currentUser.id}_${period}_${date}`;
    const found = this.rsvps.find((r) => r.id === compoundId);
    return found ? found.status : null;
  }

  public getAllRsvps(): MealRsvp[] {
    return this.rsvps;
  }

  public setRsvp(
    period: MealPeriod,
    newStatus: RsvpStatus,
    date: string = getTodayDateString()
  ): { success: boolean; message: string } {
    if (this.isCutoffPassed(period)) {
      return {
        success: false,
        message: `Cutoff time (${this.aggregates[period].cutoff}) has passed for ${period}. Changes locked.`,
      };
    }

    const compoundId = `${this.currentUser.id}_${period}_${date}`;
    const existingIndex = this.rsvps.findIndex((r) => r.id === compoundId);
    const prevStatus = existingIndex >= 0 ? this.rsvps[existingIndex].status : null;

    if (prevStatus === newStatus) {
      return { success: true, message: `RSVP already recorded as ${newStatus}.` };
    }

    // Atomic update of aggregate
    const agg = { ...this.aggregates[period] };
    if (prevStatus === 'attending' && newStatus === 'not_attending') {
      agg.attending = Math.max(0, agg.attending - 1);
      agg.notAttending += 1;
    } else if (prevStatus === 'not_attending' && newStatus === 'attending') {
      agg.attending += 1;
      agg.notAttending = Math.max(0, agg.notAttending - 1);
    } else if (prevStatus === null) {
      if (newStatus === 'attending') {
        agg.attending += 1;
      } else {
        agg.notAttending += 1;
      }
    }
    this.aggregates[period] = agg;
    this.saveToStorage(STORAGE_KEYS.AGGREGATES, this.aggregates);

    // Save record
    const record: MealRsvp = {
      id: compoundId,
      userId: this.currentUser.id,
      studentName: this.currentUser.name,
      studentId: this.currentUser.studentId || 'STU-001',
      date,
      period,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.rsvps[existingIndex] = record;
    } else {
      this.rsvps.push(record);
    }
    this.saveToStorage(STORAGE_KEYS.RSVPS, this.rsvps);

    this.notify();
    return {
      success: true,
      message: `RSVP updated to "${newStatus === 'attending' ? 'Attending' : 'Not Attending'}"! Central canteen kitchen notified.`,
    };
  }

  public getAggregateRsvps(period: MealPeriod) {
    const agg = this.aggregates[period];
    return {
      period,
      attending: agg.attending,
      notAttending: agg.notAttending,
      totalSubscribers: agg.total,
      cutoffTime: agg.cutoff,
      isCutoffPassed: this.isCutoffPassed(period),
    };
  }

  // SIMULATE MULTIPLE RANDOM RSVPs FOR PRESENTATION
  public simulateBatchStudentRsvps(count: number = 8): void {
    const periods: MealPeriod[] = ['lunch', 'dinner', 'breakfast'];
    for (let i = 0; i < count; i++) {
      const p = periods[Math.floor(Math.random() * periods.length)];
      const isAttending = Math.random() > 0.3;
      if (isAttending) {
        this.aggregates[p].attending += 1;
      } else {
        this.aggregates[p].notAttending += 1;
      }
    }
    this.saveToStorage(STORAGE_KEYS.AGGREGATES, this.aggregates);
    this.notify();
  }

  // DEMAND FORECAST & INGREDIENT CALCULATIONS
  public getDemandForecast(period: MealPeriod) {
    const attendingCount = this.aggregates[period].attending;
    const notAttendingCount = this.aggregates[period].notAttending;
    const buffer = this.plannedBuffers[period] || 15;
    const expectedDemand = attendingCount;
    const plannedQuantity = expectedDemand + buffer;

    // Calculate aggregated ingredients for all meals in this period
    const mealsInPeriod = this.getMeals(period);
    const ingredientMap: Map<string, { qty: number; unit: string; category: string }> = new Map();

    mealsInPeriod.forEach((meal) => {
      // Allocate portion among available meal choices in this period evenly or based on popularity
      const portionPortionWeight = 1 / mealsInPeriod.length;
      const mealExpectedDemand = Math.round(expectedDemand * portionPortionWeight);

      meal.recipe.forEach((ing) => {
        const current = ingredientMap.get(ing.ingredientName) || {
          qty: 0,
          unit: ing.unit,
          category: ing.category,
        };
        current.qty += mealExpectedDemand * ing.quantityPerPortion;
        ingredientMap.set(ing.ingredientName, current);
      });
    });

    const calculatedIngredients: CalculatedIngredient[] = [];
    ingredientMap.forEach((val, name) => {
      let formatted = `${val.qty} ${val.unit}`;
      if (val.unit === 'g' && val.qty >= 1000) {
        formatted = `${(val.qty / 1000).toFixed(1)} kg`;
      } else if (val.unit === 'ml' && val.qty >= 1000) {
        formatted = `${(val.qty / 1000).toFixed(1)} L`;
      }

      // Sample portion is the avg per portion
      calculatedIngredients.push({
        name,
        quantityPerPortion: Math.round(val.qty / Math.max(1, expectedDemand)),
        unit: val.unit,
        totalRequired: val.qty,
        formattedTotal: formatted,
        category: val.category,
      });
    });

    return {
      period,
      attendingRsvps: attendingCount,
      notAttendingRsvps: notAttendingCount,
      expectedDemand,
      plannedQuantity,
      buffer,
      calculatedIngredients,
    };
  }

  public setPlannedBuffer(period: MealPeriod, buffer: number): void {
    this.plannedBuffers[period] = buffer;
    this.saveToStorage(STORAGE_KEYS.PLANNED_BUFFERS, this.plannedBuffers);
    this.notify();
  }

  // FLASH SALE & SURPLUS
  public getSurplusOffers(): SurplusOffer[] {
    return this.surplusOffers;
  }

  public publishSurplusOffer(offerData: Omit<SurplusOffer, 'id' | 'createdAt' | 'status' | 'createdBy'>): {
    success: boolean;
    error?: string;
    offer?: SurplusOffer;
  } {
    if (!offerData.mealName?.trim()) {
      return { success: false, error: 'Meal name is required.' };
    }
    if (offerData.discountedPrice > offerData.originalPrice) {
      return { success: false, error: 'Discounted price cannot be greater than original price.' };
    }
    if (offerData.availableQuantity <= 0) {
      return { success: false, error: 'Available quantity must be greater than zero.' };
    }

    const newOffer: SurplusOffer = {
      ...offerData,
      id: `surplus-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: this.currentUser.name || 'Canteen Administration',
    };

    this.surplusOffers.unshift(newOffer);
    this.saveToStorage(STORAGE_KEYS.SURPLUS_OFFERS, this.surplusOffers);
    this.notify();
    return { success: true, offer: newOffer };
  }

  public updateSurplusOfferStatus(offerId: string, status: SurplusOffer['status']): void {
    this.surplusOffers = this.surplusOffers.map((o) => (o.id === offerId ? { ...o, status } : o));
    this.saveToStorage(STORAGE_KEYS.SURPLUS_OFFERS, this.surplusOffers);
    this.notify();
  }

  // ATOMIC CLAIM OPERATION
  public claimSurplusMeal(offerId: string): {
    success: boolean;
    error?: string;
    claim?: SurplusClaim;
  } {
    // 1. Locate offer
    const offerIndex = this.surplusOffers.findIndex((o) => o.id === offerId);
    if (offerIndex === -1) {
      return { success: false, error: 'Offer not found or no longer available.' };
    }

    const offer = this.surplusOffers[offerIndex];

    // 2. Check offer status & stock
    if (offer.status !== 'active' || offer.availableQuantity <= 0) {
      return {
        success: false,
        error: 'Sorry! This surplus meal has already sold out or expired.',
      };
    }

    // 3. Check student limit (one claim per offer per student)
    const existingStudentClaim = this.surplusClaims.find(
      (c) => c.offerId === offerId && c.userId === this.currentUser.id && c.status === 'claimed'
    );
    if (existingStudentClaim) {
      return {
        success: false,
        error: 'You have already claimed this offer! Please collect your existing order.',
      };
    }

    // 4. Atomic decrement
    const updatedQty = offer.availableQuantity - 1;
    const isSoldOut = updatedQty === 0;

    const updatedOffer: SurplusOffer = {
      ...offer,
      availableQuantity: updatedQty,
      status: isSoldOut ? 'sold_out' : 'active',
    };
    this.surplusOffers[offerIndex] = updatedOffer;
    this.saveToStorage(STORAGE_KEYS.SURPLUS_OFFERS, this.surplusOffers);

    // 5. Create claim record
    const claimCode = `NC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim: SurplusClaim = {
      id: `claim-${Date.now()}`,
      offerId: offer.id,
      offerMealName: offer.mealName,
      userId: this.currentUser.id,
      studentName: this.currentUser.name,
      studentId: this.currentUser.studentId || 'STU-001',
      claimedAt: new Date().toISOString(),
      claimCode,
      status: 'claimed',
      pricePaid: offer.discountedPrice,
      pickupDeadline: offer.pickupDeadline,
      pickupLocation: offer.pickupLocation,
    };

    this.surplusClaims.unshift(newClaim);
    this.saveToStorage(STORAGE_KEYS.SURPLUS_CLAIMS, this.surplusClaims);

    this.notify();
    return { success: true, claim: newClaim };
  }

  public getClaimsForUser(userId?: string): SurplusClaim[] {
    const targetUserId = userId || this.currentUser.id;
    return this.surplusClaims.filter((c) => c.userId === targetUserId);
  }

  public getAllClaims(): SurplusClaim[] {
    return this.surplusClaims;
  }

  // SUSTAINABILITY & ANALYTICS
  public getSustainabilityMetrics() {
    const totalAnnounced = this.surplusOffers.reduce((sum, o) => sum + o.initialQuantity, 0);
    const totalAvailable = this.surplusOffers.reduce((sum, o) => sum + o.availableQuantity, 0);
    const totalClaimed = this.surplusClaims.length;

    // Redistribution Rate = (Claimed / Announced) * 100 with safe division
    const redistributionRate = totalAnnounced > 0 ? (totalClaimed / totalAnnounced) * 100 : 0;

    // Configurable average edible meal weight per portion in kg (0.45 kg ~ 450g)
    const portionWeightKg = 0.45;
    const foodWasteAvoidedKg = totalClaimed * portionWeightKg;

    // Standard EPA food waste carbon factor: ~2.5 kg CO2e per kg edible food
    const co2SavedKg = foodWasteAvoidedKg * 2.5;

    // Student financial savings
    const studentMoneySavedInr = this.surplusClaims.reduce((sum, c) => {
      const offer = this.surplusOffers.find((o) => o.id === c.offerId);
      if (offer) {
        return sum + Math.max(0, offer.originalPrice - offer.discountedPrice);
      }
      return sum + 40; // baseline savings
    }, 0);

    return {
      totalAnnounced,
      totalAvailable,
      totalClaimed,
      redistributionRate: Math.round(redistributionRate),
      foodWasteAvoidedKg: Number(foodWasteAvoidedKg.toFixed(1)),
      co2SavedKg: Number(co2SavedKg.toFixed(1)),
      studentMoneySavedInr,
      historicalWeekly: HISTORICAL_ANALYTICS,
    };
  }

  // RESET DEMO TO INITIAL PRISTINE STATE
  public resetToSeedData(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.RSVPS);
    localStorage.removeItem(STORAGE_KEYS.AGGREGATES);
    localStorage.removeItem(STORAGE_KEYS.SURPLUS_OFFERS);
    localStorage.removeItem(STORAGE_KEYS.SURPLUS_CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.PLANNED_BUFFERS);
    localStorage.removeItem(STORAGE_KEYS.BYPASS_CUTOFF);

    this.users = INITIAL_USERS;
    this.currentUser = INITIAL_USERS[0];
    this.meals = INITIAL_MEALS;
    this.aggregates = JSON.parse(JSON.stringify(DEFAULT_AGGREGATES));
    this.surplusOffers = JSON.parse(JSON.stringify(INITIAL_SURPLUS_OFFERS));
    this.surplusClaims = [
      {
        id: 'claim-seed-1',
        offerId: 'surplus-1',
        offerMealName: 'Paneer Butter Masala & 4 Fresh Phulkas Combo',
        userId: 'student-2',
        studentName: INITIAL_USERS[1]?.name || 'Leon Dsouza',
        studentId: INITIAL_USERS[1]?.studentId || '2023-EC-048',
        claimedAt: new Date(Date.now() - 3600000).toISOString(),
        claimCode: 'NC-4192',
        status: 'claimed',
        pricePaid: 35,
        pickupDeadline: '3:30 PM',
        pickupLocation: 'Counter 2 (Surplus Redistribution Bay), Ground Floor Canteen',
      },
    ];
    this.rsvps = [
      {
        id: `student-1_breakfast_${getTodayDateString()}`,
        userId: 'student-1',
        studentName: INITIAL_USERS[0]?.name || 'Jaden Dsouza',
        studentId: INITIAL_USERS[0]?.studentId || '2023-CS-104',
        date: getTodayDateString(),
        period: 'breakfast',
        status: 'attending',
        updatedAt: new Date().toISOString(),
      },
      {
        id: `student-1_lunch_${getTodayDateString()}`,
        userId: 'student-1',
        studentName: INITIAL_USERS[0]?.name || 'Jaden Dsouza',
        studentId: INITIAL_USERS[0]?.studentId || '2023-CS-104',
        date: getTodayDateString(),
        period: 'lunch',
        status: 'attending',
        updatedAt: new Date().toISOString(),
      },
      {
        id: `student-1_dinner_${getTodayDateString()}`,
        userId: 'student-1',
        studentName: INITIAL_USERS[0]?.name || 'Jaden Dsouza',
        studentId: INITIAL_USERS[0]?.studentId || '2023-CS-104',
        date: getTodayDateString(),
        period: 'dinner',
        status: 'not_attending',
        updatedAt: new Date().toISOString(),
      },
    ];
    this.plannedBuffers = { breakfast: 15, lunch: 20, dinner: 15 };
    this.bypassCutoff = true;

    this.notify();
  }
}

export const store = new NutriCampusStore();
