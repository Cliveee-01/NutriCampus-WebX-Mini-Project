# NutriCampus — Smart Mess Meal Planner & Food Waste Reducer

A full-stack college mini-project web application designed to reduce food waste in university canteens by empowering students to RSVP for meals in advance, enabling canteen administrators to forecast ingredient demand dynamically, redistributing surplus food through discounted flash sales, and managing student profiles in **MongoDB Atlas**.

---

## 1. Core Features & Functional Architecture

### A. Student Portal
1. **Dashboard Overview**: Summary KPI cards showing available meals, active RSVPs, live surplus flash sales, and claimed meal tokens. Prominently reinforces the sustainability mission: *"Every meal planned is food saved."*
2. **Daily Mess Menu**: Separated tabs for Breakfast, Lunch, and Dinner. Features Indian canteen staples (Poha, Idli, Dosa, Chapati, Dal Tadka, Paneer Butter Masala, Shahi Veg Pulao, Curd Rice).
3. **Dynamic Dietary Filters**: Real-time filtering for **Vegan**, **Gluten-Free**, and **High Protein** meals with strict validation so ingredients never contradict dietary claims.
4. **Advance Meal RSVP System**: Real-time *Attending* vs *Not Attending* toggle. Enforces one authoritative record per student per session to eliminate duplicate RSVPs, respects kitchen cutoff times, and instantly syncs with kitchen demand forecasting.
5. **Surplus Food Flash Sale**: Leftover kitchen batches offered at 50%–65% discount. Atomic claiming operations prevent double-claiming, generate unique digital claim tokens (e.g., `NC-7482`), and decrement stock in real time.
6. **MongoDB Student Profile Management**: Persistent student profile connected directly to MongoDB Atlas. Stores:
   - Full Name
   - Student Email (normalized, unique)
   - Student ID
   - Room / Hostel
   - Dietary Preferences (`Vegan`, `Gluten-Free`, `High Protein`)
   - Food Allergies & Intolerances
   - Auto-generated `createdAt` and `updatedAt` timestamps and unique MongoDB `_id`.
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
5. **MongoDB Registered Student Records**: Secure administrative view (`GET /api/students`) allowing authorized cafeteria administrators to inspect all registered student profiles and dietary requirements.

---

## 2. MongoDB Database & Express Backend

### A. Database Topology
- **Database Name**: `nutricampus`
- **Collection Name**: `students`
- **Object Model**: Managed via **Mongoose** schema with unique indexes on normalized lowercase email address.

### B. Student Document Schema
```json
{
  "_id": "670ae001f0123456789abc01",
  "name": "Jaden Dsouza",
  "email": "jaden.dsouza@campus.edu",
  "studentId": "2023-CS-104",
  "roomOrHostel": "Aryabhatta Hall, Rm 312",
  "dietaryPreferences": ["High Protein"],
  "allergies": ["Peanuts"],
  "createdAt": "2026-10-12T10:00:00.000Z",
  "updatedAt": "2026-10-12T10:35:00.000Z"
}
```

### C. Backend REST Endpoints
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/students` | Creates a new student profile document | Public / Authenticated Student |
| `GET` | `/api/students` | Retrieves all registered student profiles | **Admin Only** (`x-user-role: admin`) |
| `GET` | `/api/students/:id` | Retrieves profile by MongoDB `_id` or email | Owner Student or Admin |
| `PUT` | `/api/students/:id` | Updates an existing student profile | Owner Student or Admin |
| `DELETE` | `/api/students/:id` | Deletes a student profile document | Owner Student or Admin |
| `GET` | `/api/db-status` | Health check for MongoDB connection & host | Public |

---

## 3. Environment Variables & Setup Instructions

### Step 1: Clone and Install Dependencies
```bash
git clone <repository-url>
cd nutricampus
npm install
```

### Step 2: Configure MongoDB Connection in `.env`
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Set your MongoDB Atlas connection string in `.env`:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/nutricampus?retryWrites=true&w=majority"
```
*(Replace `<username>` and `<password>` with your MongoDB Atlas database user credentials).*

### Step 3: Start the Full-Stack Application
```bash
npm run dev
```
The Express server starts on **http://localhost:3000**, connecting to MongoDB Atlas and serving the Vite React frontend with Hot Module Replacement and API proxying.

---

## 4. How to Verify Saved Records in MongoDB Atlas

1. **Log in to MongoDB Atlas** at [cloud.mongodb.com](https://cloud.mongodb.com).
2. In the left navigation sidebar, click on **Database** under Deployment.
3. Find your cluster (e.g., `Cluster0`) and click **Browse Collections**.
4. In the database list, locate the database named **`nutricampus`**.
5. Click on the collection named **`students`**.
6. You will see individual JSON documents for each registered student (e.g., Jaden Dsouza, Leon Dsouza, Clive Fernandes) containing:
   - `_id`: Unique MongoDB ObjectId
   - `name`: Student full name
   - `email`: Normalized email string
   - `dietaryPreferences`: Array of selected dietary tags
   - `allergies`: Array of declared food allergies
   - `createdAt` and `updatedAt`: Automatic ISO timestamps.
7. Any update submitted from the website profile form updates the matching document in MongoDB Atlas instantly without page reload.

---

## 5. Multi-Student Independent Testing Scenarios

To demonstrate multi-student isolation:
1. **Student A (Jaden Dsouza)**:
   - Select Jaden Dsouza in the persona switcher.
   - Navigate to **Food Profile**.
   - Check **High Protein Focus**, enter allergy `"Peanuts"`, and click **Save Preferences**.
   - Confirm server response shows success with unique MongoDB `_id`.
2. **Student B (Leon Dsouza)**:
   - Switch persona to Leon Dsouza.
   - Notice the form refreshes to Leon's own preferences (**100% Vegan**, **Gluten-Free**, zero allergies).
   - Edit preferences and save.
   - Verify in MongoDB Atlas that **both records exist as separate documents** and neither overwrites the other.
3. **Admin Verification**:
   - Switch persona to **Chef Leron & Mess Committee (Admin)**.
   - Open **Food Profile** or Admin console to view the complete list of students retrieved from `GET /api/students`.
   - Attempting `GET /api/students` from an unauthorized student persona returns HTTP 403 Forbidden.

---

## 6. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express 4, TypeScript (`tsx`).
- **Database & ODM**: MongoDB Atlas, Mongoose 9.
- **Analytics Visualization**: Chart.js v4.
- **Tooling**: Vite 8, Dotenv, CORS.
