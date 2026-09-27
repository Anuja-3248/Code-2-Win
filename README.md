# ResQLink — Real-Time Emergency Hospital Resource Allocation

**Tagline:** *Connecting ambulances to the right care, faster.*

ResQLink is a production-quality, responsive web application for real-time emergency hospital resource matching and predictive capacity forecasting.

---

## 🚑 Key Features

- **Ambulance Emergency Portal (`/ambulance`)**:
  - Direct, unauthenticated access designed for fast paramedic input.
  - Step 1: Resource selection (**ICU Beds**, **Ventilators**, **General Beds**).
  - Step 2: Quantity selector (1–10 patient units).
  - Step 3: Location coordinate acquisition (Browser GPS API + fallback emergency anchor).
  - Step 4: Sub-second matching engine with multi-step loading simulation.

- **Hospital Results & Ranking (`/ambulance/results`)**:
  - Displays top suitable hospitals matched by immediate availability and 30-minute machine learning predicted capacity.
  - Transparent **Current Availability → Predicted Availability** visual indicator.
  - Proximity metrics (Distance in km, Ambulance ETA in minutes).
  - **View Hospital Details Modal** (full capacity breakdown, ward turnover, ER direct hotline).
  - **En Route Navigation Modal** (route details, Google Maps integration, automated ER triage pre-alert).

- **Hospital Resource Portal (`/hospital/login` & `/hospital/dashboard`)**:
  - Operational dashboard with 4 real-time telemetry cards (ICU Beds, Ventilators, General Beds, Emergency Occupancy).
  - Live resource update form that dynamically broadcasts availability updates across active ambulance search queries.
  - Real-time audit history and timeline of all capacity adjustments.

---

## 🎨 Design System

- **Palette**:
  - Primary: `#176B87` (Deep Medical Teal)
  - Secondary: `#64B5C8` (Soft Teal)
  - Accent / Urgency: `#F28C8C` (Soft Coral)
  - Success / Available: `#4CAF7D` (Healthcare Green)
  - Warning / Demand: `#F4B942` (Warm Amber)
  - Emergency / Diversion: `#D9534F` (Emergency Red)
  - Background: `#F7FAFC` (Light White/Teal)
  - Cards: `#FFFFFF`
  - Text: `#243746` (Primary) & `#667085` (Secondary)
- **Typography**: **Plus Jakarta Sans** (Headings) + **DM Sans** (Body & metadata).

---

## 🔌 Backend Integration (For Sarthak / Backend Team)

The frontend architecture is isolated into dedicated service interfaces:

1. **Configuration Toggle**:
   Open [`src/services/config.ts`](file:///c:/Users/Anuja%20Pawar/OneDrive/Desktop/Code-2-Win/Code-2-Win/src/services/config.ts) and set:
   ```ts
   export const CONFIG = {
     USE_MOCK_DATA: false,
     API_BASE_URL: 'https://your-backend-api.com/v1',
   };
   ```

2. **Clean Service Layer**:
   - [`src/services/apiService.ts`](file:///c:/Users/Anuja%20Pawar/OneDrive/Desktop/Code-2-Win/Code-2-Win/src/services/apiService.ts): Main API facade consumed by React components.
   - [`src/services/hospitalService.ts`](file:///c:/Users/Anuja%20Pawar/OneDrive/Desktop/Code-2-Win/Code-2-Win/src/services/hospitalService.ts): Business queries (`findSuitableHospitals`, `getNearbyHospitals`, `updateHospitalResources`).
   - [`src/types/hospital.ts`](file:///c:/Users/Anuja%20Pawar/OneDrive/Desktop/Code-2-Win/Code-2-Win/src/types/hospital.ts) & [`src/types/emergency.ts`](file:///c:/Users/Anuja%20Pawar/OneDrive/Desktop/Code-2-Win/Code-2-Win/src/types/emergency.ts): Shared TypeScript interfaces matching the planned SQL/Firebase schema.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build for production
npm run build
```
