# Plurit - Event Discovery & Booking App

Plurit is a mobile application built with React Native and Expo that allows users to discover, wishlist, and book events. The app features a modern UI, real-time updates, and a seamless booking experience.

## 📱 Features

- **Event Discovery**: Browse events by category, search, or location
- **User Authentication**: Secure login and registration system
- **Booking System**: Book tickets for events with seat selection
- **Wishlist**: Save events for later viewing
- **Booking Management**: View and manage your bookings
- **Coupon System**: Apply discount coupons during checkout
- **Location Services**: Find events near you
- **Categories**: Filter events by entertainment, academic, or volunteering categories
- **Responsive UI**: Beautiful interface with smooth animations

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (TailwindCSS for React Native)
- **State Management**: [Legend State](https://legendapp.com/open-source/state/)
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **UI Components**: Custom components with [Lucide Icons](https://lucide.dev/)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Date Handling**: [Day.js](https://day.js.org/)
- **Notifications**: [React Native Flash Message](https://github.com/lucasferreira/react-native-flash-message)

## 📁 Project Structure

```
plurit-assessment/
├── app/ # Main application code
│ ├── (app)/ # Authenticated app screens
│ │ ├── (tabs)/ # Tab navigation screens
│ │ ├── events/ # Event detail screens
│ │ └── categories/ # Category screens
│ ├── (auth)/ # Authentication screens
│ └── components/ # Shared UI components
├── assets/ # Static assets (images, fonts)
├── lib/ # Core functionality
│ ├── db/ # Database setup and schema
│ ├── state/ # State management stores
│ └── constants/ # App constants
├── types/ # TypeScript type definitions
└── drizzle/ # Database migrations
```

## 🗄️ Data Model

The app uses a SQLite database with the following main entities:

- **Users**: Authentication and profile information
- **Events**: Event details including title, description, date, location
- **Categories**: Event categories (Entertainment, Academic, Volunteering)
- **Bookings**: User bookings with seat selection
- **Wishlist**: User's saved events
- **Coupons**: Discount coupons for events

## 🔄 State Management

The app uses Legend State for reactive state management with the following stores:

- **AuthStore**: Handles user authentication and session management
- **EventsStore**: Manages event data, categories, and recently viewed events
- **BookingsStore**: Handles booking creation, retrieval, and cancellation
- **WishlistStore**: Manages user's wishlisted events
- **LocationStore**: Handles location permissions and current location

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- iOS Simulator or Android Emulator (or physical device)
- Expo CLI

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:varun-git-personal/plurit-assessment.git
   cd plurit-assessment
   ```

2. Install dependencies:

   ```bash
   npx expo install
   ```

3. Generate the migrations.

   ```bash
   npm run generate
   ```

4. Pre-build the app before running.

   ```bash
   npx expo prebuild --clean
   ```

5. Run on iOS or Android:

   ```bash
   npm run ios
   # or
   npm run android
   ```

## 📱 App Screens

- **Home**: Discover featured and popular events
- **Bookings**: View and manage your bookings
- **Wishlist**: View your saved events
- **Account**: Manage your profile and settings
- **Event Details**: View event information and book tickets
- **Booking Flow**: Select seats, apply coupons, and complete booking
- **Login/Register**: User authentication screens

## 🧩 Key Components

- **EventCard**: Displays event information in a card format
- **CategoryCard**: Shows event categories with images
- **TariffBadge**: Displays ticket tier information (Platinum, Gold, Silver)
- **EventDetail**: Comprehensive event information display
- **BookSeats**: Interface for selecting seats and completing bookings

## 🔒 Authentication

The app uses a simple username and password that is authenticated against the database.
Sample users

- john_doe:hashedPassword123
- jane_smith:hashedPassword456
- sarah_parker:hashedPasswordABC
- mike_johnson:hashedPasswordDEF

## 🔄 Development Workflow

- **Database Changes**: Use Drizzle Kit to generate migrations

  ```bash
  npm run generate
  ```

  **Database Migrations**: The migration happens within the app when it loads.

  **Database Seeding**: The seeding functions run when the user first time lands on the onboarding screen before login.

- **Database Studio**: View and edit database content
  To look at the DB schema, and records, while the app is running on the terminal, press shift + m that is open the menu, select `Open expo-drizzle-studio-plugin` option.
