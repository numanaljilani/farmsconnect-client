import { AnimalRate, Listing, Ad, Category, Subcategory } from "@/types";

export const mockRates: AnimalRate[] = [
  { animal: "eggs", region: "Tamil Nadu", breed: "Brown", quality: "High", price: 60 },
  { animal: "chicken", region: "Punjab", breed: "Broiler", quality: "Medium", price: 150 },
  { animal: "cows", region: "Maharashtra", breed: "Jersey", quality: "High", price: 50000 },
];

export const mockListings: Listing[] = [
  { id: "1",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Fresh Organic Eggs", price: 50, location: "Kerala", category: "eggs", description: "Free-range, organic eggs.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpE5otlvdtzR_RlXOwipLa4ej4MroVhKwbzA&s", date: "2023-10-05" },
  { id: "2",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user2", title: "Broiler Chicken", price: 140, location: "Punjab", category: "chicken", description: "Healthy broiler chickens.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbtHbeCP4bIX1cm2i4c2HGY8PxtupjqL25A&s", date: "2023-10-04" },
  { id: "3",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "deactivated", owner: "user1", title: "Jersey Cow", price: 45000, location: "Maharashtra", category: "cows", description: "2-year-old healthy cow.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEqQkqFo-Ru3nLROKEMiLrW6hKLXrmvpPHIA&s", date: "2023-10-03" },
  { id: "4",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Goat Feed", price: 1000, location: "Tamil Nadu", category: "feeds", description: "Premium goat feed.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIXjPeHCBzBXZfbPbymdoAqGq1wfH8roNuug&s", date: "2023-10-02" },
  { id: "5",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Buffalo Milk", price: 80, location: "Gujarat", category: "buffaloes", description: "Fresh buffalo milk.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoJnrVWT_G7m7-wZhkoM2N48doG7ll3ZPbrQ&s", date: "2023-10-01" },
  { id: "6",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user2", title: "Desi Eggs", price: 70, location: "Kerala", category: "eggs", description: "Local desi eggs.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpE5otlvdtzR_RlXOwipLa4ej4MroVhKwbzA&s", date: "2023-09-30" },
  { id: "7",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Layer Chicken", price: 200, location: "Punjab", category: "chicken", description: "Egg-laying chickens.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbtHbeCP4bIX1cm2i4c2HGY8PxtupjqL25A&s", date: "2023-09-29" },
  { id: "8",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "deactivated", owner: "user1", title: "Holstein Cow", price: 60000, location: "Maharashtra", category: "cows", description: "High-milk yielding cow.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEqQkqFo-Ru3nLROKEMiLrW6hKLXrmvpPHIA&s", date: "2023-09-28" },
  { id: "9",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Goat Kids", price: 5000, location: "Rajasthan", category: "goats", description: "Young goats for sale.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtNhnUemNOukJGRiYR2gaugNqhKrIJZvcEgw&s", date: "2023-09-27" },
  { id: "10",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Organic Feeds", price: 1200, location: "Tamil Nadu", category: "feeds", description: "Organic animal feeds.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoJnrVWT_G7m7-wZhkoM2N48doG7ll3ZPbrQ&s", date: "2023-09-26" },
  { id: "11",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user2", title: "Farm Fresh Eggs", price: 55, location: "Kerala", category: "eggs", description: "Daily fresh eggs.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpE5otlvdtzR_RlXOwipLa4ej4MroVhKwbzA&s", date: "2023-09-25" },
  { id: "12",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "deactivated", owner: "user1", title: "Free-Range Chicken", price: 180, location: "Punjab", category: "chicken", description: "Free-range broilers.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbtHbeCP4bIX1cm2i4c2HGY8PxtupjqL25A&s", date: "2023-09-24" },
  { id: "13",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Sahiwal Cow", price: 55000, location: "Maharashtra", category: "cows", description: "Native breed cow.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEqQkqFo-Ru3nLROKEMiLrW6hKLXrmvpPHIA&s", date: "2023-09-23" },
  { id: "14",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Buffalo Calf", price: 15000, location: "Gujarat", category: "buffaloes", description: "Young buffalo calf.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoJnrVWT_G7m7-wZhkoM2N48doG7ll3ZPbrQ&s", date: "2023-09-22" },
  { id: "15",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user2", title: "Boer Goat", price: 8000, location: "Rajasthan", category: "goats", description: "Meat breed goat.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtNhnUemNOukJGRiYR2gaugNqhKrIJZvcEgw&s", date: "2023-09-21" },
  { id: "16",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "deactivated", owner: "user1", title: "Poultry Feed", price: 900, location: "Tamil Nadu", category: "feeds", description: "Balanced poultry feed.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIXjPeHCBzBXZfbPbymdoAqGq1wfH8roNuug&s", date: "2023-09-20" },
  { id: "17",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "White Eggs", price: 65, location: "Kerala", category: "eggs", description: "White shell eggs.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpE5otlvdtzR_RlXOwipLa4ej4MroVhKwbzA&s", date: "2023-09-19" },
  { id: "18",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Rooster", price: 300, location: "Punjab", category: "chicken", description: "Healthy rooster.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIXjPeHCBzBXZfbPbymdoAqGq1wfH8roNuug&s", date: "2023-09-18" },
  { id: "19",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Gir Cow", price: 70000, location: "Maharashtra", category: "cows", description: "A2 milk cow.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEqQkqFo-Ru3nLROKEMiLrW6hKLXrmvpPHIA&s", date: "2023-09-17" },
  { id: "20",quantity: 80, unit: "per kg",subcategory: "Layer Chicken",status: "active", owner: "user1", title: "Dairy Feed", price: 1100, location: "Tamil Nadu", category: "feeds", description: "Dairy animal feed.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIXjPeHCBzBXZfbPbymdoAqGq1wfH8roNuug&s", date: "2023-09-16" },
];

export const mockAds: Ad[] = [
  { id: "ad1", title: "Buy Premium Feeds", image: "/feed-ad.jpg", link: "/market" },
  { id: "ad2", title: "Sell Your Livestock", image: "/ad-livestock.jpg", link: "/sell" },
  { id: "ad3", title: "Check Daily Rates", image: "/ad-rates.jpg", link: "/rates/eggs" },
];

export const categories: Category[] = [
  { name: "Eggs", slug: "eggs", icon: "Egg" },
  { name: "Chicken", slug: "chicken", icon: "Feather" },
  { name: "Cows", slug: "cows", icon: "Cow" },
  { name: "Buffaloes", slug: "buffaloes", icon: "Cow" },
  { name: "Goats", slug: "goats", icon: "Goat" },
  { name: "Feeds", slug: "feeds", icon: "Wheat" },
];


export const subcategories: Subcategory[] = [
  { category: "eggs", name: "Brown Eggs", unit: "per 100 pieces" },
  { category: "eggs", name: "White Eggs", unit: "per 100 pieces" },
  { category: "chicken", name: "Broiler Chicken", unit: "per kg" },
  { category: "chicken", name: "Layer Chicken", unit: "per kg" },
  { category: "cows", name: "Jersey Cow", unit: "per animal" },
  { category: "cows", name: "Holstein Cow", unit: "per animal" },
  { category: "buffaloes", name: "Buffalo Milk", unit: "per liter" },
  { category: "buffaloes", name: "Buffalo Calf", unit: "per animal" },
  { category: "goats", name: "Boer Goat", unit: "per animal" },
  { category: "goats", name: "Goat Kids", unit: "per animal" },
  { category: "feeds", name: "Poultry Feed", unit: "per kg" },
  { category: "feeds", name: "Dairy Feed", unit: "per kg" },
];