"use client";
import { motion } from "framer-motion";
import { Leaf, ChevronRight, Loader2, AlertTriangle, RefreshCw } from "lucide-react"; 
import Link from "next/link";
import { AnimalCard } from "@/components/AnimalCard";
import { AdsCarousel } from "@/components/AdsCarousel";
import { Button } from "@/components/ui/button";
import { Roboto } from "next/font/google";
// RE-USING the existing API hooks
import { 
    useGetCategoriesQuery, 
    useGetListingsQuery 
} from "@/lib/api"; 

// --- Data Types (Assume these are consistent) ---
interface Listing {
    _id: string; // Use _id from MongoDB
    title: string;
    price: number;
    location: string;
    mainImage: string;
    description: string;
    category: string;
}

interface Category {
    name: string;
    slug: string;
}

// NOTE: Keeping the mockRates as no API hook was provided for this section.
interface MarketRate {
    animal: string;
    breed: string;
    price: number;
    region: string;
    quality: string;
}

const mockRates: MarketRate[] = [
    { animal: "eggs", breed: "White Leghorn", price: 6.5, region: "Delhi", quality: "A" },
    { animal: "chicken", breed: "Broiler", price: 150, region: "Mumbai", quality: "Fresh" },
];
// ------------------------------------------------------------------

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// --- Component to handle Loading/Error States for sections ---
const SectionContentWrapper: React.FC<{
    isLoading: boolean;
    isError: boolean;
    data: any[] | undefined;
    children: React.ReactNode;
    title: string;
    refetch?: () => void;
}> = ({ isLoading, isError, data, children, title, refetch }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-40 bg-white rounded-lg shadow-inner">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
                <p className="text-gray-600">Loading {title}...</p>
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-lg flex items-center justify-between shadow-inner">
                <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-semibold text-sm">
                        Failed to fetch {title}.
                    </p>
                </div>
                {refetch && (
                    <button onClick={refetch} className="text-red-600 hover:text-red-800 flex items-center space-x-1 font-medium text-sm">
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                    </button>
                )}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow-inner">
                <p className="text-gray-500">No {title.toLowerCase()} found at this time. 😔</p>
            </div>
        );
    }

    return <>{children}</>;
};

// --- Main Component ---
export default function Home() {
    // 1. Placeholder for User Location (replace with actual Geo-IP/Browser Geo API)
    const userLocation = "Kerala"; // Example: This would be fetched based on the user's IP or browser

    // 2. Fetch Categories
    const { 
        data: categoriesData, 
        isLoading: isCategoriesLoading, 
        isError: isCategoriesError,
        refetch: refetchCategories
    } = useGetCategoriesQuery();
    const categories: Category[] = categoriesData || [];

    // 3. Fetch Featured Listings (Using useGetListingsQuery with a "featured" parameter)
    const featuredQueryParams : any= { 
        limit: 3, 
        isFeatured: true, // ASSUMPTION: API uses 'isFeatured' to filter for top items
        sortBy: 'date', // Or 'popular'/'boosted'
        dateOrder: 'latestToOldest'
    };
    const { 
        data: featuredListingsResponse, 
        isLoading: isFeaturedListingsLoading, 
        isFetching: isFeaturedListingsFetching,
        isError: isFeaturedListingsError,
        refetch: refetchFeaturedListings
    } = useGetListingsQuery(featuredQueryParams);
    const featuredListings: Listing[] = featuredListingsResponse?.data || [];
    const featuredIsLoading = isFeaturedListingsLoading || isFeaturedListingsFetching;


    // 4. Fetch Nearest Listings (Using useGetListingsQuery with a location parameter)
    const nearestQueryParams : any = { 
        limit: 3, 
        location: userLocation, // Filter by mock user location
        // ASSUMPTION: The API uses the 'location' parameter to either filter by
        // exact location or calculate proximity/distance.
    };
    const { 
        data: nearestListingsResponse, 
        isLoading: isNearestListingsLoading, 
        isFetching: isNearestListingsFetching,
        isError: isNearestListingsError,
        refetch: refetchNearestListings
    } = useGetListingsQuery(nearestQueryParams);
    const nearestListings: Listing[] = nearestListingsResponse?.data || [];
    const nearestIsLoading = isNearestListingsLoading || isNearestListingsFetching;

    // Daily Market Rates (Mocked as no API hook was provided)
    const featuredRates = mockRates.slice(0, 2); 

    return (
        <main className={`${roboto.className} mx-auto px-4 py-12 sm:py-24 space-y-12 bg-green-50`}>
            
            {/* Hero Section with Carousel */}
            <section className="space-y-4 mt-5">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-gray-800 text-center"
                >
                    Welcome to Farmsconnect 🌾
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg text-gray-600 text-center mb-6"
                >
                    Gaon se Bazaar Tak, Sab Kuch Ek Jagah
                </motion.p>
                <AdsCarousel />
            </section>

            {/* --- */}

            {/* Daily Market Rates (Still using mock data structure) */}
            <section className="space-y-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <h2 className="text-2xl font-semibold text-gray-800">Daily Market Rates</h2>
                    <Link href="/home">
                        <Button variant="link" className="text-green-600 p-0">
                            View All <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredRates.map((rate, idx) => (
                        <AnimalCard
                            key={idx}
                            title={`${rate.breed} ${rate.animal.charAt(0).toUpperCase() + rate.animal.slice(1)}`}
                            price={rate.price}
                            details={`${rate.region} - ${rate.quality} quality`}
                            // link={`/rates/${rate.animal}`}
                        />
                    ))}
                </div>
            </section>

            {/* --- */}

            {/* Categories (Data from API) */}
            <section className="space-y-6">
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-2xl font-semibold text-gray-800"
                >
                    Browse Categories
                </motion.h2>
                <SectionContentWrapper 
                    isLoading={isCategoriesLoading} 
                    isError={isCategoriesError} 
                    data={categories} 
                    title="Categories"
                    refetch={refetchCategories}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category, idx) => (
                            <motion.div
                                key={category.slug}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * idx, duration: 0.3 }}
                            >
                                <Link href={`/market?category=${category.slug}`}>
                                    <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-green-100 transition-colors shadow-sm">
                                        <Leaf className="w-8 h-8 text-green-600 mb-2" />
                                        <span className="text-sm font-medium text-gray-800 text-center">{category.name}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </SectionContentWrapper>
            </section>

            {/* --- */}

            {/* Featured Listings (Data from API - General/All Listings) */}
            <section className="space-y-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <h2 className="text-2xl font-semibold text-gray-800">Featured Listings</h2>
                    <Link href="/market">
                        <Button variant="link" className="text-green-600 p-0">
                            View All <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
                <SectionContentWrapper 
                    isLoading={featuredIsLoading} 
                    isError={isFeaturedListingsError} 
                    data={featuredListings} 
                    title="Featured Listings"
                    refetch={refetchFeaturedListings}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredListings.map((listing) => (
                            <AnimalCard
                                key={listing._id}
                                title={listing.title}
                                price={listing.price}
                                details={listing.location} 
                                image={listing.mainImage || "/placeholder.jpg"} 
                                link={`/market/details/${listing._id}`}
                            />
                        ))}
                    </div>
                </SectionContentWrapper>
            </section>

            {/* --- */}

            {/* Nearest Listings (Data from API) */}
            <section className="space-y-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <h2 className="text-2xl font-semibold text-gray-800">Nearest Listings (Near {userLocation})</h2>
                    <Link href="/market">
                        <Button variant="link" className="text-green-600 p-0">
                            View All <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
                <SectionContentWrapper 
                    isLoading={nearestIsLoading} 
                    isError={isNearestListingsError} 
                    data={nearestListings} 
                    title="Nearest Listings"
                    refetch={refetchNearestListings}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nearestListings.map((listing) => (
                            <AnimalCard
                                key={listing._id}
                                title={listing.title}
                                price={listing.price}
                                details={listing.location} 
                                image={listing.mainImage || "/placeholder.jpg"} 
                                link={`/market/details/${listing._id}`}
                            />
                        ))}
                    </div>
                </SectionContentWrapper>
            </section>
        </main>
    );
}