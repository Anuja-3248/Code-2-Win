# 🚑 ResQLink — Real-Time Emergency Hospital Resource Allocation

> **Connecting ambulances to the right care, faster.**

ResQLink is a real-time emergency healthcare coordination platform designed to help ambulances quickly identify hospitals with the required medical resources.

The platform connects **ambulance teams** with **hospital resource information**, evaluates nearby hospitals based on resource availability and travel distance, provides **30-minute predicted capacity**, and allows hospitals to continuously update their emergency resources.

---

## 🎯 Problem Statement

During medical emergencies, ambulance teams may spend valuable time contacting multiple hospitals to find available ICU beds, ventilators, or general beds.

At the same time, hospitals need a reliable way to communicate their current emergency resource availability.

This lack of real-time coordination can lead to:

* Delays in finding suitable hospitals
* Unnecessary communication between ambulances and hospitals
* Difficulty identifying hospitals with sufficient resources
* Resource information becoming outdated
* Poor visibility into expected resource availability when the ambulance arrives

### 💡 Our Solution

**ResQLink** provides a centralized emergency resource coordination system where:

1. Ambulance personnel submit an emergency resource request.
2. The system obtains the ambulance's location.
3. Nearby hospitals are evaluated.
4. Available resources are compared with the requested quantity.
5. Hospital distance and estimated ambulance travel time are calculated.
6. Current and predicted 30-minute availability are displayed.
7. Suitable hospitals are presented to the ambulance team.
8. The ambulance can view hospital details, navigate to the hospital, and initiate a resource booking.
9. Hospitals can update their live resource telemetry through a dedicated dashboard.

---

# 🚨 Key Features

## 🚑 1. Ambulance Emergency Portal

The ambulance interface is designed for quick emergency input without requiring hospital-side authentication.

### Emergency request flow

* Select required medical resource:

  * ICU Beds
  * Ventilators
  * General Beds
* Select required quantity
* Obtain current location using browser GPS
* Use Pune as a fallback location when GPS is unavailable
* Submit emergency request
* Automatically search nearby hospitals

The system supports quantities from **1–10 units**.

---

## 🏥 2. Intelligent Hospital Matching

ResQLink evaluates nearby hospitals based on:

* Current resource availability
* Requested resource quantity
* Hospital distance
* Estimated ambulance travel time
* Predicted resource availability after 30 minutes

The system evaluates hospitals within the configured search area and returns up to the **top 3 suitable hospitals**.

### Matching logic

For every hospital, ResQLink determines:

```text
Current Availability
        ↓
Requested Quantity Check
        ↓
Distance Calculation
        ↓
Ambulance ETA Calculation
        ↓
30-Minute Predicted Availability
        ↓
Hospital Status
        ↓
Suitable Hospital Results
```

Hospitals are considered suitable when their **current available resource count is greater than or equal to the requested quantity**.

---

## 📊 3. 30-Minute Capacity Prediction

The platform displays predicted resource availability for approximately 30 minutes ahead.

The system maintains telemetry such as:

* Current available resources
* Occupied resources
* Admissions during the last 30 minutes
* Discharges during the last 30 minutes
* Emergency arrivals
* Occupancy rates
* Calculated resource totals
* Predicted availability after 30 minutes

The architecture also preserves historical 30-minute telemetry records, allowing the stored data to support future machine-learning development.

> **Note:** The current implementation contains a 30-minute prediction/calculation layer; it should not be described as a trained ML model unless a separate trained model is connected to the project.

---

# 🏥 4. Hospital Control Portal

Hospitals have a dedicated authentication and operational dashboard.

### Hospital features

* Hospital account creation
* Hospital login
* Automatically generated facility ID
* Resource availability management
* ICU telemetry
* Ventilator telemetry
* General bed telemetry
* Occupancy information
* Admissions and discharge information
* Emergency arrival information
* 30-minute telemetry storage
* Activity/audit history

Hospital IDs follow a sequential format such as:

```text
H001
H002
H003
...
```

---

# 📡 5. Real-Time Resource Updates

Hospital resource changes are stored and propagated through the application's data layer.

When hospital resource information changes, ambulance-side hospital searches can refresh their available matches.

This allows the ambulance interface to work with the most recently available hospital resource information.

---

# 📍 6. Location & ETA

ResQLink uses browser geolocation to determine the ambulance's current location.

The system calculates:

* Distance between ambulance and hospital
* Approximate ambulance ETA

The current implementation uses an estimated average ambulance speed of:

```text
35 km/h
```

This is intended as an approximate emergency travel estimate rather than live traffic-based navigation.

---

# 🗺️ 7. Hospital Details & Navigation

For each suitable hospital, the ambulance user can access:

* Hospital name
* Hospital location
* Resource availability
* Predicted availability
* Distance
* Estimated ETA
* Emergency contact information
* Hospital resource details

The application also provides navigation functionality and Google Maps integration.

---

# 🛏️ 8. Emergency Resource Booking

After selecting a suitable hospital, the ambulance team can initiate an emergency resource booking.

The booking workflow includes:

```text
Emergency Request
       ↓
Hospital Search
       ↓
Suitable Hospital
       ↓
View Hospital
       ↓
Book Emergency Resource
       ↓
Booking Confirmation
       ↓
Navigation / En Route
```

An active booking can also be displayed through the application's live booking status interface.

---

# 🔐 9. Firebase Integration

ResQLink uses Firebase for cloud-based application functionality.

### Firebase services used

* **Firebase Authentication**

  * Hospital account authentication
  * Hospital login/signup

* **Cloud Firestore**

  * Hospital records
  * Resource telemetry
  * Historical 30-minute records

* **Firebase Realtime Database**

  * Database integration is initialized for real-time application requirements

The application also maintains a local storage cache/fallback for hospital and activity information.

---

# 🧮 Resource Telemetry

Each hospital can maintain telemetry for three major resource categories:

| Resource     | Availability | Occupancy | 30-Min Prediction |
| ------------ | -----------: | --------: | ----------------: |
| ICU Beds     |            ✅ |         ✅ |                 ✅ |
| Ventilators  |            ✅ |         ✅ |                 ✅ |
| General Beds |            ✅ |         ✅ |                 ✅ |

Additional telemetry includes:

* Admissions
* Discharges
* Emergency arrivals
* Occupancy rate
* Resource totals
* Timestamped historical records

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      ResQLink       │
                    │   Web Application   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
      ┌───────────────┐                 ┌────────────────┐
      │ Ambulance App │                 │ Hospital Portal│
      └───────┬───────┘                 └───────┬────────┘
              │                                 │
              │ Emergency Request               │ Resource Update
              ▼                                 ▼
      ┌────────────────────────────────────────────────┐
      │             Application Service Layer          │
      │                                                │
      │  • Hospital Search                             │
      │  • Resource Matching                           │
      │  • Distance Calculation                        │
      │  • ETA Calculation                             │
      │  • Capacity Prediction                         │
      │  • Booking                                     │
      └──────────────────────┬─────────────────────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ Firebase Services │
                   ├───────────────────┤
                   │ Authentication    │
                   │ Firestore         │
                   │ Realtime Database  │
                   └───────────────────┘
```

---

# 🧩 Technology Stack

## Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **React Router**
* **Lucide React**
* CSS

## Backend / Cloud Services

* **Firebase Authentication**
* **Cloud Firestore**
* **Firebase Realtime Database**

## Browser APIs

* Geolocation API
* Session Storage
* Local Storage

## Development Tools

* TypeScript
* Vite
* Oxlint
* npm

---

# 📁 Project Structure

```text
Code-2-Win/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   │
│   ├── assets/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── ActiveBookingBanner.tsx
│   │   ├── AmbulanceUnitHeader.tsx
│   │   ├── BookingModal.tsx
│   │   ├── HospitalCard.tsx
│   │   ├── HospitalDetailModal.tsx
│   │   ├── NavigationModal.tsx
│   │   ├── ResourceCard.tsx
│   │   ├── ResourceUpdateForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ...
│   │
│   ├── data/
│   │   └── mockHospitals.ts
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AmbulancePage.tsx
│   │   ├── HospitalResultsPage.tsx
│   │   ├── HospitalLogin.tsx
│   │   └── HospitalDashboard.tsx
│   │
│   ├── services/
│   │   ├── ambulanceService.ts
│   │   ├── apiService.ts
│   │   ├── bookingService.ts
│   │   ├── config.ts
│   │   ├── firebase.ts
│   │   ├── hospitalService.ts
│   │   └── locationService.ts
│   │
│   ├── types/
│   │   ├── emergency.ts
│   │   └── hospital.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

---

# 🔄 Application Workflow

### Ambulance Workflow

```text
Open ResQLink
      ↓
Ambulance Portal
      ↓
Select Required Resource
      ↓
Select Quantity
      ↓
Get Current Location
      ↓
Search Hospitals
      ↓
Evaluate Hospital Availability
      ↓
Calculate Distance & ETA
      ↓
Check 30-Minute Availability
      ↓
Display Suitable Hospitals
      ↓
View Hospital Details
      ↓
Book / Navigate
```

### Hospital Workflow

```text
Hospital Portal
      ↓
Sign Up / Login
      ↓
Hospital Dashboard
      ↓
Enter Resource Telemetry
      ↓
Calculate Occupancy & Predictions
      ↓
Save Current Telemetry
      ↓
Store Historical 30-Minute Record
      ↓
Update Hospital Availability
```

---

# 🧠 Hospital Matching Algorithm

For every hospital, ResQLink calculates a match using resource availability and proximity.

### Availability Score

The implementation calculates an availability component based on the ratio between available resources and requested resources.

### Proximity Score

The proximity component decreases as the hospital becomes farther from the ambulance.

### Match Score

Conceptually:

```text
Match Score
    =
Availability Score
    +
Proximity Score
```

The system then identifies hospitals that currently have enough resources and returns the closest suitable results.

Hospital status can be represented as:

* `Available`
* `Suitable`
* `High Demand`
* `Critical Capacity`

---

# 📍 Default Configuration

The current configuration includes:

```text
Default Location:
Pune, Maharashtra

Latitude:
18.5204

Longitude:
73.8567

Search Radius:
25 km

Estimated Ambulance Speed:
35 km/h
```

The hospital matching service can also evaluate a wider candidate range during the matching process.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Code-2-Win
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> Never commit private credentials, secrets, or production configuration values to GitHub.

## 4. Start Development Server

```bash
npm run dev
```

The Vite development server will provide a local URL, typically:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# 🧹 Linting

Run the project's linter with:

```bash
npm run lint
```

---

# 🔑 Main Application Routes

| Route                 | Purpose                                |
| --------------------- | -------------------------------------- |
| `/`                   | ResQLink landing page                  |
| `/ambulance`          | Ambulance emergency request portal     |
| `/ambulance/results`  | Suitable hospital results              |
| `/hospital/login`     | Hospital authentication                |
| `/hospital/dashboard` | Hospital resource management dashboard |

---

# 🔮 Future Enhancements

The current architecture can be extended with:

### 🤖 Advanced Machine Learning

Replace the current prediction layer with a trained ML model using historical hospital telemetry.

Possible inputs:

* Historical admissions
* Discharges
* Emergency arrivals
* Occupancy rates
* Time of day
* Day of week
* Hospital resource type
* Historical demand patterns

Possible outputs:

```text
Predicted ICU Availability
Predicted Ventilator Availability
Predicted General Bed Availability
```

### 📍 Live Traffic-Based ETA

Integrate a real-time mapping/traffic service to replace the current estimated-speed ETA calculation.

### 🏥 Hospital Network Expansion

Support multiple cities and larger hospital networks.

### 📊 Analytics Dashboard

Add:

* Historical demand graphs
* Resource utilization trends
* Hospital performance analytics
* Emergency demand forecasting

### 🔔 Real-Time Notifications

Notify hospitals when an ambulance is approaching or has requested emergency resources.

### 🔒 Enhanced Security

Implement production-grade:

* Role-based access control
* Firestore security rules
* Server-side validation
* Secure API architecture
* Audit logging

---

# ⚠️ Current Implementation Notes

* Hospital data is designed around Firebase Firestore with local-storage caching/fallback.
* Browser geolocation requires user permission.
* Ambulance ETA is an estimate based on configured average speed and does not represent live traffic conditions.
* The current 30-minute prediction layer is based on the application's telemetry/calculation architecture; a separately trained ML model can be integrated later.
* Firebase configuration should be supplied through environment variables for production deployment.
* The repository contains a `.env` file in the uploaded archive; secrets and environment-specific credentials should be excluded from public Git repositories.

---

# 👥 Team

**Project:** ResQLink
**Team:** Code-2-Win

Built as an emergency healthcare technology solution focused on reducing the time required to identify suitable hospital resources.

---

# 📄 License

This project is developed for educational, hackathon, and prototype purposes.

