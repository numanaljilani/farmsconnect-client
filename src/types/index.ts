export interface AnimalRate {
  animal: string;
  region: string;
  breed: string;
  quality: string;
  price: number;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subcategory: string;
  description: string;
  image?: string;
  date: string;
  status: "active" | "deactivated";
  owner: string;
  quantity: number;
  unit: string; // e.g., "per 100 pieces", "per kg", "per liter"
}

export interface Ad {
  id: string;
  title: string;
  image: string;
  link: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
}

export interface Subcategory {
  category: string; // Matches Category slug
  name: string;
  unit: string; // e.g., "per 100 pieces", "per kg"
}


// Define the full structure of the data returned by the detail API
export interface ListingDetails {
    _id: string; 
    title: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    subcategory: string;
    location: string;
    mainImage: string;
    additionalImages: string[];
    // Ensure these fields match your Mongoose model and controller response
    postedBy: { 
        userId: string; 
        name: string; 
        contact: string; 
    };
    createdAt: string;
    unit?: string;
    status?: string;
}

// Define the structure of the API response wrapper
export interface ListingDetailsResponse {
    success: boolean;
    data: ListingDetails;
}