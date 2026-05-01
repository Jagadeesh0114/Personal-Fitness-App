# It's Time — Your Personal Fitness Coach

**It's Time** is a premium, mobile-first Progressive Web App (PWA) designed to be your strict personal fitness coach. Built with React, Vite, and Tailwind CSS, it works completely offline, calculates your exact calorie needs, and keeps you accountable with daily tracking.

## Features

- **Google Authentication:** Securely log in using your Google account to keep your data isolated.
- **Local Fallback Authentication:** Full local username and password system for non-Google users.
- **Calorie Engine:** Automatically calculates your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation.
- **Calendar Tracking:** Keep a flawless streak with an intuitive, color-coded calendar that tracks your consistency.
- **Progressive Web App (PWA):** Install it directly to your iOS or Android home screen for a full-screen native app experience.
- **Offline First:** All data is securely stored on your device using an advanced local storage architecture.

## Getting Started

To run this project locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Google Client ID:
   - Copy `.env.example` to `.env` (if available) or create a `.env` file.
   - Add your Google OAuth Web Client ID:
     ```
     VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 7
- **Styling:** Tailwind CSS v4
- **Routing:** TanStack Router
- **Icons:** Lucide React
- **Auth:** @react-oauth/google & jwt-decode

## Deployment
This app is ready to be deployed to Vercel. 
Use the Vercel CLI (`npx vercel`) for a one-click deployment.

---
*Built to help you stay consistent. It's time to work.*
