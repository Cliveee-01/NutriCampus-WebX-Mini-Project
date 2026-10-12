# NutriCampus — Smart Mess Meal Planner & Food Waste Reducer

A full-stack college mini-project web application designed to reduce food waste in university canteens by empowering students to RSVP for meals in advance, enabling canteen administrators to forecast ingredient demand dynamically, and redistributing surplus food through discounted flash sales.

---

## 1. Core Features & Functional Architecture

### A. Student Portal
1. **Dashboard Overview**: Summary KPI cards showing available meals, active RSVPs, live surplus flash sales, and claimed meal tokens. Prominently reinforces the sustainability mission: *"Every meal planned is food saved."*
2. **Daily Mess Menu**: Separated tabs for Breakfast, Lunch, and Dinner. Features Indian canteen staples (Poha, Idli, Dosa, Chapati, Dal Tadka, Paneer Butter Masala, Shahi Veg Pulao, Curd Rice).
3. **Dynamic Dietary Filters**: Real-time filtering for **Vegan**, **Gluten-Free**, and **High Protein** meals with strict validation so ingredients never contradict dietary claims.
4. **Advance Meal RSVP System**: Real-time *Attending* vs *Not Attending* toggle. Enforces one authoritative record per student per session to eliminate duplicate RSVPs, respects kitchen cutoff times, and instantly syncs with kitchen demand forecasting.
5. **Surplus Food Flash Sale**: Leftover kitchen batches offered at 50%–65% discount. Atomic claiming operations prevent double-claiming, generate unique digital claim tokens (e.g., `NC-7482`), and decrement stock in real time.
6. **Student Food Profile**: Preferences (Vegan, Gluten-Free, High-Protein) highlight compliant dishes with a "Profile Match" indicator while maintaining accessible manual filters. Clearly distinguishes everyday dining preferences from institutional allergen safety warnings.
7. **My Claims**: Digital token repository displaying pickup window countdowns, canteen counter locations, and personal kilograms of food waste prevented.

### B. Canteen Admin Portal
1. **Administrative Overview**: High-level KPI strip tracking total attendance RSVPs across Breakfast, Lunch, and Dinner, expected demand, raw ingredient procurement kg, active surplus listings, and redistribution rate.
2. **Demand Forecasting & Dynamic Recipe Scaler**:
   - Transparent rule-based formula:
     $$\text{Expected Demand} = \text{Attending RSVPs}$$
     $$\text{Required Ingredient Quantity} = \text{Expected Demand} \times \text{Ingredient Quantity per Portion}$$
   - Editable portion recipes allow chefs to adjust gram weight per student with instant recalculation of total raw material procurement orders.
   - Interactive **Chart.js** bar chart comparing Expected Demand, Planned Preparation (with buffer), and Campus Hostel Capacity.
3. **Surplus Food Announcement Engine**: Form to broadcast surplus portions with required field validations (discounted price $\le$ original price, quantity $> 0$, pickup windows). Offers appear immediately in the student portal.
4. **Food Waste & Sustainability Analytics**:
   - Redistribution Rate calculation:
     $$\text{Redistribution Rate} = \left(\frac{\text{Surplus Meals Claimed}}{\text{Surplus Meals Announced}}\right) \times 100$$
   - Engineered estimate of edible waste avoided based on 450g per portion.
   - EPA-standard greenhouse gas abatement calculation: $2.5\text{ kg CO}_2\text{e}$ per kg food waste saved.
   - Interactive **Chart.js** Doughnut and Line trend charts for weekly waste prevention.

---

## 2. Database Schema (Firebase Firestore)

The application models its real-time data into 6 primary Firestore collections:

- `users/{userId}`: User profiles, role (`student` | `admin`), student roll number, dietary preferences, and declared allergies.
- `meals/{mealId}`: Canteen menu offerings, session period, description, pricing, dietary tags, and portion recipes.
- `mealRSVPs/{compoundId}`: Compound key (`${userId}_${period}_${date}`) guaranteeing atomic uniqueness of student meal commitments without duplicates.
- `surplusOffers/{offerId}`: Discounted surplus announcements, available inventory counters, pickup deadlines, and status (`active`, `sold_out`, `expired`).
- `surplusClaims/{claimId}`: Atomic reservation records linking student ID, offer ID, claim token code, and collection status.
- `dailyAnalytics/{date}`: Aggregated daily statistics for food saved (kg), redistribution rate %, and student monetary savings.

---

## 3. Demonstration & Examiner Viva Walkthrough

To demonstrate the full end-to-end functionality during a project viva presentation:

1. **Step 1 (Student Menu & Dietary Filter)**: Open the **Daily Menu** and toggle the **"Vegan"** or **"High Protein"** filter. Observe that non-matching items filter out instantaneously.
2. **Step 2 (Student RSVP)**: Navigate to **Meal RSVP** and set Lunch to **"Attending"**.
3. **Step 3 (Admin Demand Forecast Update)**: Use the top bar switcher to switch to **Canteen Admin Portal** $\rightarrow$ **Demand Forecast**. Notice that the Lunch RSVP count and the calculated ingredient weights (Rice, Dal, Paneer) have increased.
4. **Step 4 (Simulate Live Campus Batch)**: Click **"Simulate +8 RSVPs"** in the top demo banner. Observe the Demand Forecast bar chart and raw ingredient kilogram totals dynamically jump.
5. **Step 5 (Admin Surplus Broadcast)**: In **Surplus Broadcast**, publish a new surplus offer with discounted price and quantity.
6. **Step 6 (Student Flash Sale Claim)**: Switch back to **Student Portal** $\rightarrow$ **Flash Sale**. The new surplus meal is live. Click **Claim Surplus Meal**.
7. **Step 7 (Atomic Claim Receipt)**: A modal displays **"Claimed Successfully!"** with a unique pickup reference code (e.g., `NC-8491`).
8. **Step 8 (Inventory Decrement)**: Observe the available quantity decrement immediately. Attempting to claim again shows the duplicate claim safeguard.
9. **Step 9 (Sustainability Analytics)**: Open **Analytics** in the Admin portal to inspect the updated **Redistribution Rate** and **Chart.js** charts.

---

## 4. Local Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nutricampus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional for live Firebase):
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 5. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Analytics Visualization**: Chart.js v4.
- **Data Engine**: Reactive store with atomic transaction simulator and persistent `localStorage` synchronization (ready for direct Firestore SDK binding).
- **Tooling**: Vite 8, tsx, Node.js / Express backend architecture.
