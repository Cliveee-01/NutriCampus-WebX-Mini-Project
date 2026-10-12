# Product Requirements Document (PRD)
## Project Name: NutriCampus — Smart Mess Meal Planner & Food Waste Reducer
**Version**: 1.0.0  
**Document Type**: Engineering & Product Specification (College Mini-Project)  
**Date**: October 2026  
**Status**: Approved & Implemented  
**Authors & Contributors**:
- **Jaden Dsouza** (Student Lead / Full-Stack Engineer — Roll No: 2023-CS-104)
- **Leon Dsouza** (Frontend & UX Architect — Roll No: 2023-EC-048)
- **Clive Fernandes** (Systems & Data Engineer — Roll No: 2022-ME-219)
- **Chef Leron & Mess Committee** (Institutional Food Service & Canteen Operations)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Campus Food Waste Paradox
In university and collegiate residential campuses, hostel canteens serve thousands of meals daily across breakfast, lunch, and dinner. However, attendance fluctuates drastically due to:
- Irregular class schedules, project deadlines, and lab vivas.
- Weekend departures, club activities, and spontaneous off-campus dining.
- Changing individual dietary preferences and unnotified absences.

Because canteen supervisors lack advance visibility into student attendance, institutional kitchens cook fixed batches based on total enrolled hostel capacity (e.g., 350+ students). This leads to:
1. **Excess Preparation & Waste**: 30% to 45% of cooked food remains unconsumed and is discarded into municipal landfills, generating methane emissions.
2. **Financial Losses**: Campus dining operations absorb substantial overhead in wasted raw ingredients, cooking fuel, and manual labor.
3. **Student Inconvenience**: Students arriving toward the end of service often face either shortages of fresh food or have no way to access discounted surplus portions affordably.

### 1.2 The NutriCampus Solution
**NutriCampus** is an end-to-end digital food planning and surplus redistribution web platform designed to eliminate canteen waste at the source. The platform establishes a bidirectional, real-time feedback loop:
- **Advance Student RSVPs**: Students commit to meals before strict kitchen cutoff windows.
- **Dynamic Demand Forecasting & Ingredient Scaling**: Confirmed student headcounts directly drive modular recipe calculations, calculating exact kilogram procurement amounts.
- **Atomic Surplus Flash Sales**: Leftover batch portions are immediately broadcast at 50%–65% discount to students before meal periods conclude.
- **Environmental & Financial Telemetry**: Real-time tracking of food waste diverted from landfills (kg), greenhouse gas abatement ($\text{kg CO}_2\text{e}$), and student money saved.

---

## 2. Product Objectives & Key Success Metrics (OKRs / KPIs)

| Metric | Baseline (Traditional Mess) | Target (NutriCampus) | Measurement Method |
| :--- | :--- | :--- | :--- |
| **Kitchen Overproduction** | 35% – 45% buffer | $\le$ 5% – 7% buffer | Planned batch size vs. actual consuming attendees |
| **Edible Waste Diverted** | 0 kg (discarded to trash) | $\ge$ 85% of surplus rescued | Surplus meals claimed via Flash Sale / Total announced |
| **RSVP Participation Rate** | 0% (Blind cooking) | $\ge$ 75% student responses | Attending + Not Attending RSVPs / Total Hostellers |
| **Procurement Accuracy** | Bulk static estimates | Exact recipe portion scaling | Recipe Portions $\times$ Confirmed RSVP count |
| **Student Cost Savings** | Fixed mess fee only | ₹40 – ₹55 savings / surplus meal | Original meal price minus Flash Sale price |

---

## 3. User Personas & Stakeholder Profiles

### Persona A: Jaden Dsouza (Hostel Resident / Student)
- **Profile**: 3rd Year Computer Science student residing in Aryabhatta Hall.
- **Habits**: Attends classes early, frequently has unpredictable afternoon lab submissions, high protein diet focus.
- **Frustrations**: Hates wasting mess food; misses lunch announcements; wants quick, nutritious, affordable food.
- **Goals**: Check today's menu in 10 seconds, toggle RSVP with one click, receive allergen transparency, and grab discounted surplus snacks during late study hours.

### Persona B: Leon Dsouza (Vegan / Dietary Focused Student)
- **Profile**: 2nd Year Electronics student residing in Gargi Hostel.
- **Habits**: Strict vegan and gluten-free lifestyle.
- **Frustrations**: Unclear mess menus where gravies contain hidden dairy (curd/ghee) or gluten.
- **Goals**: Filter menu instantly to 100% compliant meals and save dietary preferences in a persistent profile.

### Persona C: Chef Leron (Head Canteen Superintendent & Mess Committee)
- **Profile**: Executive campus chef managing kitchen operations, procurement, and staff.
- **Habits**: Prepares raw ingredients 3 hours prior to meal service; balances strict budget limits.
- **Frustrations**: Throwing away large pots of dal and rice because students went out without warning.
- **Goals**: View exact student headcounts per meal session, know exact kilogram requirements for rice, dal, and paneer, and broadcast surplus food in 30 seconds.

---

## 4. System Architecture & Technical Specifications

### 4.1 Technology Stack
- **Frontend Framework**: React 19 SPA running on Vite 8 and TypeScript.
- **Design System & Styling**: Tailwind CSS v4, Plus Jakarta Sans typography, Phosphor/Lucide icons, Motion micro-interactions.
- **Data Visualization**: Chart.js v4 for responsive, high-performance canvas analytics.
- **Backend Architecture**: Node.js / Express proxy-ready service with reactive in-memory / Firestore-compatible transaction layer.
- **Data Persistence**: LocalStorage multi-tab synchronization with Firestore collections blueprint schema.

### 4.2 High-Level Architecture Diagram
```
+-------------------------------------------------------------------------+
|                              NutriCampus                                |
+------------------------------------+------------------------------------+
|           STUDENT PORTAL           |        CANTEEN ADMIN PORTAL        |
|  - Daily Menu & Dietary Filters    |  - Real-Time Attendance Monitor    |
|  - Advance RSVP (Cutoff-Aware)     |  - Rule-Based Demand Scaler        |
|  - Surplus Flash Sale (Claiming)   |  - Recipe Portion Matrix           |
|  - Dietary Profile & Allergies     |  - Surplus Food Broadcast Engine   |
|  - Digital Claim Token Storage     |  - Sustainability Analytics (Chart)|
+------------------------------------+------------------------------------+
                                      |
                     [ Reactive Store / API Broker ]
                      - Multi-Student Identity Mock
                      - Concurrency Locks & Claims
                      - Cutoff Window Validator
                                      |
                     [ Data Persistence & Schema ]
        users · meals · mealRSVPs · surplusOffers · surplusClaims
```

---

## 5. Functional Requirements & Feature Matrix

### 5.1 Public & Authentication Layer
- **FR-1.1 (Landing Page)**: Present brand identity ("Every meal planned is food saved"), value proposition, impact metrics, and seamless role-based navigation.
- **FR-1.2 (Role-Based Access Control)**: Enforce distinct interfaces for `student` and `admin`. Unauthorized access to administrative controls is prevented.
- **FR-1.3 (Interactive Demo Switcher)**: Provide an instant switcher between pre-seeded personas (Jaden Dsouza, Leon Dsouza, Clive Fernandes, and Chef Leron) for live academic vivas.

### 5.2 Student Portal Specifications
- **FR-2.1 (Personalized Dashboard)**: Display greeting, sustainability impact banner, and 4 summary KPI cards (Today's Menu Items, Current RSVP Decision, Live Flash Sales, Claimed Meals).
- **FR-2.2 (Daily Mess Menu)**:
  - Three distinct meal period tabs: **Breakfast** (7:30–9:30 AM), **Lunch** (12:00–2:30 PM), and **Dinner** (7:30–9:30 PM).
  - High-fidelity food photography for each meal card.
  - Dietary filters (**Vegan**, **Gluten-Free**, **High Protein**) that dynamically filter meals based on true ingredient definitions.
  - Ingredient and Allergen Disclosure Modal displaying full ingredient composition and explicit cross-contamination warnings.
- **FR-2.3 (Advance Meal RSVP System)**:
  - Two unambiguous choices: **Attending** vs. **Not Attending**.
  - Strict uniqueness: Exactly one RSVP stored per student, meal period, and calendar date.
  - Cutoff Rules: Breakfast cutoff at 6:30 AM, Lunch cutoff at 10:30 AM, Dinner cutoff at 5:30 PM.
  - Instant aggregate update: Changing RSVP increments/decrements kitchen forecasts in real time.
- **FR-2.4 (Surplus Food Flash Sale)**:
  - Displays surplus dishes with original price, discounted price, percentage off, remaining stock bar, pickup deadline, and counter location.
  - Atomic Claim Transaction:
    1. Validates available quantity $> 0$ and active offer status.
    2. Validates student has not already claimed the offer.
    3. Decrements inventory atomically.
    4. Issues unique claim code (e.g., `NC-7482`).
    5. Displays "Claimed Successfully!" confirmation popup.
    6. Disables claiming when stock reaches zero (*Sold Out*).
- **FR-2.5 (Student Food Profile)**:
  - Allows students to save preferences: Vegan, Gluten-Free, High-Protein, and reported food allergies.
  - Highlights compliant meals on the menu with a *Profile Match* badge.
  - Medical Safety Notice: Explicitly reminds students that preference matching does not guarantee allergen-free preparation in a shared institutional kitchen.
- **FR-2.6 (My Claims)**:
  - Repository of claimed tokens, pickup instructions, payment amounts, and estimated food waste prevented.

### 5.3 Canteen Admin Portal Specifications
- **FR-3.1 (Admin Dashboard)**: High-level KPI cards tracking total RSVPs, lunch demand, raw ingredient procurement kg, active flash sales, surplus claimed, and food saved.
- **FR-3.2 (Demand Forecasting & Dynamic Recipe Scaler)**:
  - Mathematical formulation:
    $$\text{Expected Demand} = \text{Attending RSVPs}$$
    $$\text{Planned Prep} = \text{Expected Demand} + \text{Kitchen Buffer}$$
    $$\text{Procurement Amount} = \text{Expected Demand} \times \text{Ingredient Portion Weight}$$
  - Dynamic Portion Table: Editable ingredient portion weights (e.g., Rice: 150g, Paneer: 90g) with live recalculation of procurement weights in kg or L.
  - Chart.js Bar Chart comparing Expected Demand, Planned Batch, and Hostel Capacity.
- **FR-3.3 (Surplus Broadcast Engine)**:
  - Form validation: Validates meal name, original price, discounted price ($\le$ original price), quantity ($> 0$), pickup window, and declared allergens.
  - Real-time inventory table allowing administrators to monitor remaining stock, total student claims, and deactivate expired offers.
- **FR-3.4 (Sustainability & Waste Analytics)**:
  - Redistribution Rate: $(\text{Surplus Claimed} / \text{Surplus Announced}) \times 100\%$.
  - Food Waste Avoided (kg): Calculated at $0.45\text{ kg}$ edible food per portion claimed.
  - Greenhouse Gas Abatement: $2.5\text{ kg CO}_2\text{e}$ per kg food waste diverted.
  - Responsive Chart.js Doughnut (Redistribution Ratio) and 7-Day Line Trend Chart.
- **FR-3.5 (Menu & Recipe Configuration)**:
  - Inspection and adjustment of canteen dish ingredients and portion benchmarks.

---

## 6. Data Model & Database Schema (Firestore Blueprint)

### 6.1 Collection Definitions

```typescript
// 1. users Collection
interface UserDocument {
  id: string; // e.g., 'student-1'
  name: string; // e.g., 'Jaden Dsouza'
  email: string; // e.g., 'jaden.dsouza@campus.edu'
  role: 'student' | 'admin';
  studentId?: string; // e.g., '2023-CS-104'
  roomOrHostel?: string;
  dietaryPreferences: {
    vegan: boolean;
    glutenFree: boolean;
    highProtein: boolean;
  };
  allergies?: string[];
}

// 2. meals Collection
interface MealDocument {
  id: string; // e.g., 'meal-l1'
  name: string; // e.g., 'Paneer Butter Masala Thali'
  period: 'breakfast' | 'lunch' | 'dinner';
  description: string;
  servingTime: string;
  price: number; // in INR (₹)
  imageUrl: string;
  dietaryTags: Array<'Vegan' | 'Gluten-Free' | 'High Protein' | 'Vegetarian' | 'Contains Dairy'>;
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  caloriesEstimate: number;
  proteinGrams: number;
  recipe: Array<{
    ingredientName: string;
    quantityPerPortion: number; // in g or ml
    unit: 'g' | 'kg' | 'ml' | 'L';
    category: 'Grains' | 'Dairy' | 'Vegetables' | 'Spices' | 'Legumes' | 'Oil';
  }>;
}

// 3. mealRSVPs Collection
interface MealRsvpDocument {
  id: string; // Compound Key: `${userId}_${period}_${date}`
  userId: string;
  studentName: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  period: 'breakfast' | 'lunch' | 'dinner';
  status: 'attending' | 'not_attending';
  updatedAt: string; // ISO Timestamp
}

// 4. surplusOffers Collection
interface SurplusOfferDocument {
  id: string; // e.g., 'surplus-1'
  mealName: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  availableQuantity: number; // Atomically decremented on claim
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

// 5. surplusClaims Collection
interface SurplusClaimDocument {
  id: string; // e.g., 'claim-1791824400'
  offerId: string;
  offerMealName: string;
  userId: string;
  studentName: string;
  studentId: string;
  claimedAt: string;
  claimCode: string; // e.g., 'NC-7482'
  status: 'claimed' | 'collected' | 'cancelled';
  pricePaid: number;
  pickupDeadline: string;
  pickupLocation: string;
}

// 6. dailyAnalytics Collection
interface DailyAnalyticsDocument {
  date: string; // YYYY-MM-DD or Day
  surplusAnnounced: number;
  surplusClaimed: number;
  surplusWasted: number;
  foodSavedKg: number;
  co2SavedKg: number;
  studentSavingsInr: number;
}
```

### 6.2 Security Rules Specification (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Can read profiles, edit own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Meals: Public read, Admin-only write
    match /meals/{mealId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // RSVPs: Owner can create/update before cutoff; Admin can read all
    match /mealRSVPs/{rsvpId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Surplus Offers: Public read, Admin write
    match /surplusOffers/{offerId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Surplus Claims: Students can claim, Admin can inspect all
    match /surplusClaims/{claimId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance & Latency
- **Page Load Time**: Initial interactive render $\le 1.2\text{s}$ over 4G connections.
- **Client-Side Recalculations**: Demand forecast and ingredient weight updates settle in $\le 50\text{ms}$.
- **Simulated Transaction Latency**: Flash Sale claim feedback resolves within $200\text{ms} - 300\text{ms}$ with visual loading spinners.

### 7.2 Concurrency & Data Integrity
- **Atomic Stock Protection**: Concurrency locks ensure that two students claiming the final surplus portion simultaneously cannot trigger negative stock levels.
- **Idempotent RSVPs**: Compound keying (`${userId}_${period}_${date}`) prevents duplicate student attendance counts even under rapid clicking.

### 7.3 Accessibility & Legibility
- **WCAG AA Compliance**: High-contrast text pairing (forest green `#1C3B2B`, lime `#2E7D32`, and slate `#0F172A`).
- **Tabular Figures**: Tabular numerals (`tabular-nums`) used for all quantities, monetary amounts, and time values to eliminate layout jitter.
- **Responsive Layout**: Fluid breakpoints from mobile (375px) to desktop (1440px).

---

## 8. College Project Viva Demonstration Protocol

During academic viva presentations, examiners evaluate end-to-end functionality using this sequence:

| Step | Action | Expected Output | Verification Point |
| :--- | :--- | :--- | :--- |
| **1** | Open **Daily Menu** | Displays breakfast, lunch, and dinner items. | Food photography and dietary tags render cleanly. |
| **2** | Click **"Vegan"** filter | Non-vegan items (Paneer, Curd Rice) vanish. | Filter strictly obeys ingredients. |
| **3** | Navigate to **Meal RSVP** | Select **"Attending"** for Lunch. | Success message displays; student status updates. |
| **4** | Switch to **Canteen Admin** | Open **Demand Forecast**. | Attending RSVPs and raw ingredient weights increase. |
| **5** | Click **"Simulate +8 RSVPs"** | Injected student batches increment count. | Chart.js bar chart and ingredient table jump dynamically. |
| **6** | Open **Surplus Broadcast** | Publish a 50% discounted meal batch. | Form validates required fields; offer saves. |
| **7** | Switch to **Student Portal** | Open **Flash Sale**. | Newly announced meal appears with discount tag. |
| **8** | Click **"Claim Surplus Meal"** | Stock decrements; popup appears. | **Claimed Successfully!** modal shows token (e.g. `NC-7482`). |
| **9** | Switch to **Analytics** | Review **Sustainability Analytics**. | Redistribution rate % and food saved kg advance. |

---

## 9. Future Roadmap & Iteration 2.0
1. **IoT Digital Weigh-Scale Integration**: Automatic tare-weight logging on disposal bin scales to record measured waste vs. estimated waste.
2. **Predictive Attendance AI**: Historical machine learning models forecasting attendance dips during exam weeks, holidays, and heavy rain.
3. **RFID / QR Turnstile Scanner**: Students scan their digital claim QR code at physical canteen turnstiles for instant tray collection.
4. **Push Notifications & Webhooks**: SMS or Telegram alerts when hot surplus meals are announced at 2:15 PM.
