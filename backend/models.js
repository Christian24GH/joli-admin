import mongoose from "mongoose";

// Case
const caseSchema = new mongoose.Schema({
  title: String,
  caseType: String,
  due: String,
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now },
});
export const Case = mongoose.models.Case || mongoose.model("Case", caseSchema);

// Contract
const contractSchema = new mongoose.Schema({
  title: String,
  due: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
export const Contract = mongoose.models.Contract || mongoose.model("Contract", contractSchema);

// Document
const documentSchema = new mongoose.Schema({
  title: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});
export const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

// Compliance
const complianceSchema = new mongoose.Schema({
  title: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
});
export const Compliance = mongoose.models.Compliance || mongoose.model("Compliance", complianceSchema);

// Advisory
const advisorySchema = new mongoose.Schema({
  advice: String,
  linkedTo: String,
  createdAt: { type: Date, default: Date.now },
});
export const Advisory = mongoose.models.Advisory || mongoose.model("Advisory", advisorySchema);

// Task
const taskSchema = new mongoose.Schema({
  task: String,
  assignedTo: String,
  due: String,
  createdAt: { type: Date, default: Date.now },
});
export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// Visitor
const visitorSchema = new mongoose.Schema({
  name: String,
  contact: String,
  nationality: String,
  passport: String,
  preferences: {
    food: String,
    activities: String,
    accommodations: String,
  },
  emergency: {
    name: String,
    relationship: String,
    contact: String,
  },
  special: {
    medical: String,
    accessibility: String,
  },
  bookings: [
    {
      package: String,
      destinations: [String],
      dates: [String],
      flights: String,
      hotel: String,
      transport: String,
      itinerary: String,
      paymentStatus: String,
      bookingStatus: String,
    }
  ],
  checkInLogs: [
    {
      type: String, // "arrival", "departure", "activity"
      date: String,
      location: String,
    }
  ],
  documents: [
    {
      type: String, // "passport", "visa", "insurance", "waiver"
      url: String,
      uploadedAt: Date,
    }
  ],
  notifications: [
    {
      message: String,
      date: Date,
      read: { type: Boolean, default: false }
    }
  ],
  guides: [
    {
      guideId: String,
      name: String,
      assignedAt: Date,
    }
  ],
  group: String,
  billing: {
    total: Number,
    paid: Number,
    status: String, // "partial", "full", "installment"
    breakdown: String,
    discounts: String,
  },
  feedback: [
    {
      type: String, // "tour", "guide", "accommodation"
      message: String,
      date: Date,
      rating: Number,
    }
  ],
  incidents: [
    {
      description: String,
      date: Date,
      resolved: Boolean,
    }
  ],
  createdAt: { type: Date, default: Date.now },
});
export const Visitor = mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);

// Facility
const facilitySchema = new mongoose.Schema({
  type: String,
  name: String,
  capacity: Number,
  amenities: [String],
  price: Number,
  photos: [String],
  description: String,
});
export const Facility = mongoose.models.Facility || mongoose.model("Facility", facilitySchema);

// Reservation
const reservationSchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility" },
  start: String,
  end: String,
  group: String,
  customer: String,
  purpose: String,
  price: Number,
  status: { type: String, default: "pending" },
  payment: Number,
  paymentStatus: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
export const Reservation = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);

// User
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: "customer" }, // e.g., admin, staff, manager, agent, customer, tour guide
  department: { type: String, default: "Core" }, // HR, Core, Logistics, Administrative, Financials
  permissions: [String], // e.g., ["view_hr", "edit_financials"]
  status: { type: String, default: "pending" },
  active: { type: Boolean, default: true },
  groups: [String],
  preferences: {
    language: String,
    timezone: String,
    notifications: Boolean,
    travel: String,
  },
  logs: [
    {
      action: String,
      date: Date,
      details: String,
    }
  ],
  createdAt: { type: Date, default: Date.now },
});
export const User = mongoose.models.User || mongoose.model("User", userSchema);