# 🚑 ResQLink

### Real-Time Emergency Hospital Resource Allocation

> **Connecting ambulances to the right care, faster.**

ResQLink is a real-time emergency healthcare coordination platform that helps ambulance teams identify suitable hospitals based on resource availability, distance, estimated travel time, and predicted capacity.

The platform creates a communication bridge between ambulances and hospitals by allowing hospitals to update emergency resource information through a dedicated dashboard while enabling ambulance teams to search, compare, and book available resources.

> **Project status:** Educational and hackathon prototype  
> **Primary location:** Pune, Maharashtra, India  
> **Team:** Code-2-Win

***

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Core Features](#-core-features)
- [Application Workflow](#-application-workflow)
- [Hospital Matching System](#-hospital-matching-system)
- [30-Minute Capacity Prediction](#-30-minute-capacity-prediction)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Firebase Data Management](#-firebase-data-management)
- [Default Configuration](#-default-configuration)
- [Installation and Setup](#-installation-and-setup)
- [Available Commands](#-available-commands)
- [Application Routes](#-application-routes)
- [Current Implementation Notes](#-current-implementation-notes)
- [Future Enhancements](#-future-enhancements)
- [Team](#-team)
- [License](#-license)

***

## 🌍 Overview

During a medical emergency, ambulance teams may lose valuable time calling multiple hospitals to locate ICU beds, ventilators, or general beds.

ResQLink addresses this coordination problem through a centralized platform that allows ambulance personnel to:

- Submit emergency resource requests.
- Share their current location.
- Discover nearby hospitals.
- Compare current resource availability.
- Review estimated ambulance travel time.
- View approximately 30-minute predicted availability.
- Initiate emergency resource bookings.
- Navigate to the selected hospital.

Hospitals can update their resource telemetry through an authenticated operational dashboard.

***

## 🚨 Problem Statement

Emergency ambulance teams often face difficulty finding hospitals with the required resources at the right time.

This can result in:

- Delays in identifying suitable hospitals.
- Repeated phone calls between ambulance teams and hospitals.
- Difficulty verifying ICU, ventilator, or bed availability.
- Resource information becoming outdated.
- Poor visibility into expected availability when the ambulance arrives.
- Inefficient emergency resource coordination.

ResQLink is designed to reduce these delays by providing a structured and centralized resource discovery system.

***

## 💡 Our Solution

ResQLink evaluates nearby hospitals using emergency resource and location data.

The platform follows this process:

```text
Emergency Resource Request
            ↓
Ambulance Location
            ↓
Nearby Hospital Search
            ↓
Resource Availability Check
            ↓
Distance and ETA Calculation
            ↓
30-Minute Capacity Estimation
            ↓
Hospital Ranking
            ↓
Booking and Navigation
```

Hospitals can continuously update their resource information, while ambulance teams can view the latest available data before selecting a destination.

***

## ✨ Core Features

### 🚑 Ambulance Emergency Portal

The ambulance portal is designed for quick emergency input with minimal interaction.

Features include:

- Selection of required medical resource:
  - ICU beds
  - Ventilators
  - General beds
- Quantity selection from 1 to 10 units.
- Browser-based GPS location detection.
- Pune location fallback when GPS is unavailable.
- Automatic search for suitable nearby hospitals.
- Hospital comparison based on resource availability and distance.
- Access to hospital details and emergency contact information.
- Emergency resource booking.
- Navigation through Google Maps integration.
- Live active booking status.

***

### 🏥 Intelligent Hospital Matching

ResQLink evaluates hospitals using multiple factors:

- Current resource availability.
- Requested resource quantity.
- Distance from the ambulance.
- Estimated ambulance travel time.
- Predicted availability after approximately 30 minutes.
- Hospital operating status.
- Overall suitability.

A hospital is considered suitable when its currently available resource count is greater than or equal to the requested quantity.

The system returns up to the top three suitable hospitals from the configured search area.

***

### 📊 30-Minute Capacity Prediction

ResQLink displays an estimated resource availability for approximately 30 minutes into the future.

The prediction layer uses hospital telemetry such as:

- Current available resources.
- Occupied resources.
- Admissions during the previous 30 minutes.
- Discharges during the previous 30 minutes.
- Emergency arrivals.
- Occupancy rates.
- Total resource capacity.

Historical 30-minute telemetry records are preserved to support future analytics and machine-learning development.

> **Important:** The current implementation contains a 30-minute calculation and prediction layer. It should not be described as a trained machine-learning model unless a separately trained model is integrated into the project.

***

### 🏥 Hospital Control Portal

Hospitals have access to a dedicated authentication and operations dashboard.

Hospital portal features include:

- Hospital account creation.
- Hospital login.
- Automatically generated facility IDs.
- ICU resource management.
- Ventilator resource management.
- General bed management.
- Occupancy tracking.
- Admission information.
- Discharge information.
- Emergency arrival information.
- 30-minute telemetry storage.
- Activity and audit history.

Hospital IDs follow a sequential format:

```text
H001
H002
H003
...
```

***

### 📡 Real-Time Resource Updates

Hospital resource changes are stored and propagated through the application data layer.

When a hospital updates its resource information:

1. The latest data is stored.
2. The hospital record is updated.
3. Ambulance-side searches can refresh available matches.
4. New emergency requests can use the most recent resource information.

This allows the ambulance interface to work with updated hospital availability data.

***

### 📍 Location and ETA Calculation

ResQLink uses the browser Geolocation API to determine the ambulance's current location.

The platform calculates:

- Distance between the ambulance and hospital.
- Approximate ambulance travel time.
- Hospital proximity for ranking and comparison.

The current implementation uses an estimated average ambulance speed of:

```text
35 km/h
```

This is an approximate calculation and does not represent live traffic-based navigation.

***

### 🗺️ Hospital Details and Navigation

For each suitable hospital, ambulance teams can view:

- Hospital name.
- Hospital location.
- Current resource availability.
- Predicted resource availability.
- Distance from the ambulance.
- Estimated ETA.
- Emergency contact information.
- Hospital resource details.

The system also provides Google Maps navigation support.

***

### 🛏️ Emergency Resource Booking

After selecting a suitable hospital, the ambulance team can initiate an emergency booking.

```text
Emergency Request
        ↓
Hospital Search
        ↓
Suitable Hospital
        ↓
Hospital Details
        ↓
Emergency Resource Booking
        ↓
Booking Confirmation
        ↓
Navigation / En Route
```

An active booking can be displayed through the application's live booking status interface.

***

## 🔄 Application Workflow

### Ambulance Workflow

```text
Open ResQLink
      ↓
Open Ambulance Portal
      ↓
Select Required Resource
      ↓
Select Resource Quantity
      ↓
Obtain Current Location
      ↓
Search Nearby Hospitals
      ↓
Evaluate Hospital Availability
      ↓
Calculate Distance and ETA
      ↓
Check 30-Minute Availability
      ↓
Display Suitable Hospitals
      ↓
View Hospital Details
      ↓
Book Resource or Navigate
```

### Hospital Workflow

```text
Open Hospital Portal
      ↓
Sign Up or Login
      ↓
Open Hospital Dashboard
      ↓
Enter Resource Telemetry
      ↓
Calculate Occupancy and Prediction
      ↓
Save Current Telemetry
      ↓
Store Historical Record
      ↓
Update Hospital Availability
```

***

## 🧠 Hospital Matching System

The hospital matching service evaluates every hospital using resource availability and proximity.

### Matching Process

```text
Current Availability
        ↓
Requested Quantity Check
        ↓
Distance Calculation
        ↓
Ambulance ETA Calculation
        ↓
30-Minute Availability Estimation
        ↓
Hospital Status Evaluation
        ↓
Suitable Hospital Results
```

### Availability Score

The availability component is calculated using the relationship between currently available resources and requested resources.

Conceptually:

```text
Availability Score =
Available Resources / Requested Resources
```

### Proximity Score

The proximity score decreases as the distance between the ambulance and hospital increases.

### Match Score

The system conceptually combines availability and proximity:

```text
Match Score =
Availability Score + Proximity Score
```

Hospitals that currently have sufficient resources are prioritized, and the closest suitable hospitals are returned to the ambulance team.

### Hospital Status Categories

A hospital can be represented using statuses such as:

- Available
- Suitable
- High Demand
- Critical Capacity

***

## 📈 Resource Telemetry

Each hospital can manage telemetry for three major resource categories.

| Resource Type | Availability | Occupancy | 30-Minute Prediction |
|---|---:|---:|---:|
| ICU Beds | ✅ | ✅ | ✅ |
| Ventilators | ✅ | ✅ | ✅ |
| General Beds | ✅ | ✅ | ✅ |

Additional telemetry includes:

- Admissions.
- Discharges.
- Emergency arrivals.
- Occupancy percentage.
- Total resource capacity.
- Timestamped historical records.
- Calculated predicted availability.

***

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      ResQLink       │
                         │    Web Application  │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              │                                           │
              ▼                                           ▼
      ┌───────────────┐                           ┌────────────────┐
      │ Ambulance App │                           │ Hospital Portal│
      └───────┬───────┘                           └───────┬────────┘
              │                                           │
              │ Emergency Request                         │ Resource Update
              ▼                                           ▼
      ┌────────────────────────────────────────────────────────┐
      │              Application Service Layer                  │
      │                                                        │
      │  • Hospital Search                                     │
      │  • Resource Matching                                   │
      │  • Distance Calculation                                │
      │  • ETA Calculation                                     │
      │  • Capacity Prediction                                 │
      │  • Emergency Booking                                   │
      └──────────────────────────┬─────────────────────────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │   Firebase Services │
                      ├─────────────────────┤
                      │ Authentication      │
                      │ Cloud Firestore     │
                      │ Realtime Database   │
                      └─────────────────────┘
```

***

## 🧩 Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Lucide React
- CSS

### Backend and Cloud Services

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database

### Browser APIs and Storage

- Browser Geolocation API
- Session Storage
- Local Storage

### Development Tools

- TypeScript
- Vite
- Oxlint
- npm

***

## 📁 Project Structure

```text
Code-2-Win/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
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

***

## 🔥 Firebase Integration

ResQLink uses Firebase for cloud-based application functionality.

### Firebase Authentication

Used for:

- Hospital account registration.
- Hospital login.
- Authenticated dashboard access.
- Hospital identity management.

### Cloud Firestore

Used to store:

- Hospital records.
- Resource telemetry.
- Current hospital availability.
- Historical 30-minute records.
- Booking-related information.
- Activity and audit data.

### Firebase Realtime Database

The project initializes Firebase Realtime Database for real-time application requirements and future live-update functionality.

### Local Storage Fallback

The application also maintains local storage-based caching and fallback behavior for hospital and activity information.

***

## 📍 Default Configuration

| Configuration | Value |
|---|---|
| Default location | Pune, Maharashtra |
| Latitude | 18.5204 |
| Longitude | 73.8567 |
| Search radius | 25 km |
| Estimated ambulance speed | 35 km/h |
| Maximum requested quantity | 10 units |
| Maximum displayed suitable hospitals | 3 |

The hospital matching service may evaluate a wider candidate range during the matching process before returning the most suitable results.

***

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Code-2-Win
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Do not commit private credentials, secrets, or production configuration values to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

The Vite development server will usually be available at:

```text
http://localhost:5173
```

***

## 🛠️ Available Commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run the project linter |

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Linting

```bash
npm run lint
```

***

## 🔑 Application Routes

| Route | Purpose |
|---|---|
| `/` | ResQLink landing page |
| `/ambulance` | Ambulance emergency request portal |
| `/ambulance/results` | Suitable hospital results |
| `/hospital/login` | Hospital authentication |
| `/hospital/dashboard` | Hospital resource management dashboard |

***

## ⚠️ Current Implementation Notes

- Hospital data is designed around Firebase Firestore with local-storage caching and fallback support.
- Browser geolocation requires user permission.
- Pune is used as the fallback location when GPS data is unavailable.
- Ambulance ETA is estimated using an average speed of 35 km/h.
- The ETA does not represent live traffic conditions.
- The current 30-minute prediction layer is based on telemetry and calculation logic.
- The current prediction layer is not a trained machine-learning model.
- A trained machine-learning model can be integrated in a future version.
- Firebase configuration should be provided through environment variables.
- The repository archive contains a `.env` file; secrets and environment-specific credentials should be removed before publishing the project publicly.
- This project is intended for educational, demonstration, and hackathon use.
- The platform should not be used as a replacement for official emergency dispatch or clinical decision-making systems.

***

## 🔮 Future Enhancements

### 🤖 Advanced Machine Learning

Replace the current prediction layer with a trained model using historical hospital telemetry.

Potential inputs include:

- Historical admissions.
- Historical discharges.
- Emergency arrivals.
- Occupancy rates.
- Time of day.
- Day of week.
- Hospital resource type.
- Historical demand patterns.

Potential outputs include:

- Predicted ICU availability.
- Predicted ventilator availability.
- Predicted general bed availability.

### 📍 Live Traffic-Based ETA

Integrate a real-time mapping and traffic service to improve ambulance arrival-time calculations.

### 🏥 Hospital Network Expansion

Expand the platform to support:

- Multiple cities.
- Larger hospital networks.
- Regional emergency coordination.
- Public and private hospitals.

### 📊 Analytics Dashboard

Add analytics for:

- Historical emergency demand.
- Resource utilization trends.
- Hospital performance.
- Emergency demand forecasting.
- Average booking and response times.

### 🔔 Real-Time Notifications

Notify hospitals when:

- An ambulance requests a resource.
- An ambulance is approaching.
- A booking is created.
- Resource availability changes.

### 🔒 Enhanced Security

Implement production-grade:

- Role-based access control.
- Firestore security rules.
- Server-side validation.
- Secure API architecture.
- Audit logging.
- Protected hospital and booking data.

***

## 👥 Team
1.@Anuja-3248 - Anuja Pawar
2.@codewithvardan - Vardan Darunte 
3.@rohankotsulwar-hue - Rohan Kotsulwar
4.@sarthakankolekar-lab - Sarthak Ankolekar

***

### Code-2-Win

ResQLink was developed as an emergency healthcare technology solution focused on reducing the time required to identify suitable hospital resources.

***

## 📄 License

This project is developed for educational, hackathon, and prototype purposes. 