import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "./models/Product.js";

const MONGODB_URI = process.env.MONGODB_URI || "";
console.log(MONGODB_URI,"URI")
const dummyProducts = [
  {
    name: "Wireless Mechanical Keyboard",
    price: 120,
    category: "Electronics",
  },
  {
    name: "Ergonomic Gaming Mouse",
    price: 65,
    category: "Electronics",
  },
  {
    name: "UltraWide Monitor 34\"",
    price: 450,
    category: "Electronics",
  },
  {
    name: "Noise Cancelling Headphones",
    price: 250,
    category: "Audio",
  },
  {
    name: "Minimalist Desk Pad",
    price: 25,
    category: "Accessories",
  },
  {
    name: "USB-C Multi-Port Hub",
    price: 40,
    category: "Accessories",
  },
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Optional: Clear existing products before seeding to prevent duplicates
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert dummy data
    const createdProducts = await Product.insertMany(dummyProducts);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();