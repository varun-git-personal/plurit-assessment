import dayjs from "dayjs";

// Mock data for userAuth
export const mockUserAuth = [
  {
    userId: "user_001",
    username: "john_doe",
    email: "john@example.com",
    password: "hashedPassword123", // In production, this should be properly hashed
    isVerified: 1,
  },
  {
    userId: "user_002",
    username: "jane_smith",
    email: "jane@example.com",
    password: "hashedPassword456",
    isVerified: 1,
  },
  {
    userId: "user_003",
    username: "alex_wilson",
    email: "alex@example.com",
    password: "hashedPassword789",
    isVerified: 0,
  },
  {
    userId: "user_004",
    username: "sarah_parker",
    email: "sarah@example.com",
    password: "hashedPasswordABC",
    isVerified: 1,
  },
  {
    userId: "user_005",
    username: "mike_johnson",
    email: "mike@example.com",
    password: "hashedPasswordDEF",
    isVerified: 1,
  },
];

// Mock data for userProfile
export const mockUserProfiles = mockUserAuth.map((auth) => ({
  userId: auth.userId,
  firstName: auth.username.split("_")[0],
  lastName: auth.username.split("_")[1],
  phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.username}`,
  dateOfBirth: dayjs()
    .subtract(Math.floor(Math.random() * 20 + 20), "years")
    .valueOf(),
  gender: Math.random() > 0.5 ? "male" : "female",
  city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][
    Math.floor(Math.random() * 5)
  ],
  bio: `Hi, I'm ${
    auth.username.split("_")[0]
  }! I love attending events and meeting new people.`,
  preferences: JSON.stringify({
    categories: ["Entertainment", "Academic", "Volunteering"],
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    preferredCities: ["New York", "Los Angeles"],
    preferredLanguages: ["English", "Spanish"],
  }),
  lastActive: Date.now(),
}));
