export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  roomOrHostel?: string;
  avatarUrl?: string;
  dietaryPreferences: {
    vegan: boolean;
    glutenFree: boolean;
    highProtein: boolean;
    jainFriendly?: boolean;
  };
  allergies?: string[];
}

export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

export type DietaryTag = 'Vegan' | 'Gluten-Free' | 'High Protein' | 'Vegetarian' | 'Contains Dairy';

export interface IngredientPortion {
  ingredientName: string;
  quantityPerPortion: number; // in grams or ml
  unit: 'g' | 'kg' | 'ml' | 'L' | 'pcs';
  category: 'Grains' | 'Dairy' | 'Vegetables' | 'Spices' | 'Legumes' | 'Oil';
}

export interface MealItem {
  id: string;
  name: string;
  period: MealPeriod;
  description: string;
  servingTime: string;
  price: number; // in INR ₹ (e.g. 0 if included in mess subscription, or meal price)
  imageUrl: string;
  dietaryTags: DietaryTag[];
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  caloriesEstimate: number;
  proteinGrams: number;
  recipe: IngredientPortion[];
}

export type RsvpStatus = 'attending' | 'not_attending';

export interface MealRsvp {
  id: string; // compound: ${userId}_${mealPeriod}_${date}
  userId: string;
  studentName: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  period: MealPeriod;
  status: RsvpStatus;
  updatedAt: string;
}

export interface SurplusOffer {
  id: string;
  mealName: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  availableQuantity: number;
  initialQuantity: number;
  pickupStartTime: string;
  pickupDeadline: string;
  pickupLocation: string;
  ingredients: string[];
  allergens: string[];
  status: 'active' | 'sold_out' | 'expired' | 'deactivated';
  createdAt: string;
  createdBy: string;
}

export interface SurplusClaim {
  id: string;
  offerId: string;
  offerMealName: string;
  userId: string;
  studentName: string;
  studentId: string;
  claimedAt: string;
  claimCode: string; // e.g. NC-7482
  status: 'claimed' | 'collected' | 'cancelled';
  pricePaid: number;
  pickupDeadline: string;
  pickupLocation: string;
}

export interface MealAggregateRsvp {
  period: MealPeriod;
  attending: number;
  notAttending: number;
  totalSubscribers: number;
  cutoffTime: string;
  isCutoffPassed: boolean;
}

export interface CalculatedIngredient {
  name: string;
  quantityPerPortion: number;
  unit: string;
  totalRequired: number;
  formattedTotal: string;
  category: string;
}

export interface DailySustainabilityStats {
  date: string;
  surplusAnnounced: number;
  surplusClaimed: number;
  surplusWasted: number;
  foodSavedKg: number;
  co2SavedKg: number;
  studentSavingsInr: number;
}
