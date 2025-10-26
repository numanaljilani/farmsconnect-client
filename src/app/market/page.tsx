"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    ChevronDown,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Search,
    X,
    Plus,
} from "lucide-react";
import { AnimalCard } from "@/components/AnimalCard";
import { Roboto } from "next/font/google";
import { useGetCategoriesQuery, useGetListingsQuery } from "@/lib/api";

// -----------------------------------------------------------
// 1. Data Types (Unchanged)
// -----------------------------------------------------------
interface Listing {
    _id: string;
    title: string;
    price: number;
    description: string;
    location: string;
    mainImage: string;
    category: string;
}

interface Category {
    name: string;
    slug: string;
}

type SortOption = "lowToHigh" | "highToLow" | "latestToOldest" | "oldestToLatest";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// -----------------------------------------------------------
// 2. Filter Modal Component (RESPONSIVENESS IMPROVED)
// -----------------------------------------------------------

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sort: SortOption;
    onSortChange: (sort: SortOption) => void;
    getSortLabel: (key: SortOption) => string;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    categories,
    selectedCategory,
    onCategoryChange,
    sort,
    onSortChange,
    getSortLabel
}) => {
    if (!isOpen) return null;

    // Local state for pending changes
    const [tempCategory, setTempCategory] = useState(selectedCategory);
    const [tempSort, setTempSort] = useState(sort);

    // Sync temp state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempCategory(selectedCategory);
            setTempSort(sort);
        }
    }, [isOpen, selectedCategory, sort]);

    const handleApply = () => {
        // Apply changes globally
        onCategoryChange(tempCategory);
        onSortChange(tempSort);
        onClose();
    };
    
    const handleReset = () => {
        setTempCategory("all");
        setTempSort("latestToOldest");
        // Don't apply yet, let user hit apply or close
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // IMPROVED: Use items-end on small screens for a bottom drawer effect
            className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" 
        >
            <motion.div
                // IMPROVED: Use y: "100%" to animate from the bottom on small screens, and y: 0 for desktop
                initial={{ y: "100%", opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.3 }}
                // IMPROVED: Use rounded-t-xl on mobile, rounded-xl on desktop
                className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" 
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-green-600" />
                        Advanced Filters
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-lg">
                        {[{ slug: "all", name: "All Categories" }, ...categories].map((category) => (
                            <button
                                key={category.slug}
                                onClick={() => setTempCategory(category.slug)}
                                className={`w-full px-4 py-2 text-left text-sm rounded-lg transition-colors ${
                                    tempCategory === category.slug 
                                        ? "bg-green-600 text-white font-semibold shadow-md" 
                                        : "bg-gray-50 text-gray-700 hover:bg-green-100"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                    <div className="space-y-2">
                        {["latestToOldest", "highToLow", "lowToHigh"].map((sortKey) => (
                            <button
                                key={sortKey}
                                onClick={() => setTempSort(sortKey as SortOption)}
                                className={`w-full px-4 py-2 text-left text-sm rounded-lg transition-colors ${
                                    tempSort === sortKey 
                                        ? "bg-green-600 text-white font-semibold shadow-md" 
                                        : "bg-gray-50 text-gray-700 hover:bg-green-100"
                                }`}
                            >
                                {getSortLabel(sortKey as SortOption)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6 pt-4 border-t">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 text-sm font-semibold bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
                    >
                        Apply Filters
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// -----------------------------------------------------------
// 3. Market Component (RESPONSIVENESS IMPROVED)
// -----------------------------------------------------------
const ITEMS_PER_PAGE = 12;

export default function Market() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State from URL Parameters (Unchanged) ---
    const initialCategory = searchParams.get("category") || "";
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialSort = (searchParams.get("sort") as SortOption) || "latestToOldest";
    const initialSearch = searchParams.get("search") || "";

    // --- Component State (Unchanged) ---
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sort, setSort] = useState<SortOption>(initialSort);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);

    // --- Debounce Effect & RTK Query (Unchanged) ---
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== initialSearch) {
                setDebouncedSearchTerm(searchTerm);
                setCurrentPage(1);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, initialSearch]);

    const { data: categoriesData, isLoading: isCategoriesLoading, error: categoriesError } = useGetCategoriesQuery();
    const categories: Category[] = categoriesData || [];
    
    const listingQueryParams: any = useMemo(() => {
        return {
            page: currentPage.toString(),
            limit: ITEMS_PER_PAGE.toString(),
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: debouncedSearchTerm || undefined,
            sortBy: (sort === 'lowToHigh' || sort === 'highToLow') ? 'price' : 'date',
            priceOrder: (sort === 'lowToHigh') ? 'lowToHigh' : (sort === 'highToLow' ? 'highToLow' : undefined),
            dateOrder: (sort === 'latestToOldest') ? 'latestToOldest' : (sort === 'oldestToLatest' ? 'oldestToLatest' : undefined),
        };
    }, [currentPage, selectedCategory, debouncedSearchTerm, sort]);

    const { 
        data: listingsResponse, 
        isLoading: isListingsLoading, 
        isFetching: isListingsFetching,
        error: listingsError, 
        refetch: refetchListings
    } = useGetListingsQuery(listingQueryParams);

    const listings: Listing[] = listingsResponse?.data || [];
    const totalCount = listingsResponse?.count || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const isLoading = isListingsLoading || isListingsFetching;

    // --- URL State Sync & Handlers (Unchanged) ---
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
        params.set("page", currentPage.toString());
        params.set("sort", sort);
        
        router.push(`/market?${params.toString()}`, { scroll: false });
        if (currentPage !== initialPage) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [currentPage, sort, selectedCategory, debouncedSearchTerm, router, initialPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSortChange = (newSort: SortOption) => {
        setSort(newSort);
        setCurrentPage(1);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setCurrentPage(1);
    };
    
    const handleCardClick = (listingId: string) => {
        router.push(`/market/details/${listingId}`);
    };

    const categoryTitle =
        selectedCategory === "all"
            ? "All Categories"
            : categories.find((cat) => cat.slug === selectedCategory)?.name ||
                "All Categories";
        
    const getSortLabel = (key: SortOption) => {
        switch (key) {
            case "lowToHigh": return "Price: Low to High";
            case "highToLow": return "Price: High to Low";
            case "latestToOldest": return "Date: Newest (Default)";
            case "oldestToLatest": return "Date: Oldest";
            default: return "Date: Newest (Default)";
        }
    }

    // --- Pagination Render Helper (Unchanged) ---
    const renderPaginationButtons = () => {
        const pagesToShow = [];
        const maxPages = totalPages;
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(maxPages, currentPage + 2);

        if (maxPages <= 7) {
            for (let i = 1; i <= maxPages; i++) {
                pagesToShow.push(i);
            }
        } else {
            pagesToShow.push(1);
            if (startPage > 3) pagesToShow.push(-1); 
            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== maxPages) pagesToShow.push(i);
            }
            if (endPage < maxPages - 2) pagesToShow.push(-1); 
            if (maxPages !== 1) pagesToShow.push(maxPages);
        }
        
        return Array.from(new Set(pagesToShow)).filter(p => p !== 0).sort((a,b) => a - b).map((page) => {
            if (page === -1) {
                return <span key={Math.random()} className="px-2 py-2 text-gray-500">...</span>;
            }
            return (
                <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === page
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {page}
                </button>
            );
        });
    };

    // --- Render ---

    return (
        <main
            className={`${roboto.className} w-full bg-gray-100 text-gray-800 min-h-screen px-4 py-10 sm:py-16`}
        >
            <div className="container mx-auto max-w-7xl py-10">
                
                


                {/* --------------------------------------------------- */}
                {/* --- FILTER & SEARCH CARD (RESPONSIVENESS IMPROVED) --- */}
                {/* --------------------------------------------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col gap-4 mb-10 p-4 bg-white shadow-lg rounded-xl"
                >
                    {/* Main Row: Search, Filter Button, and Create Button */}
                    {/* IMPROVED: Increased gap on mobile, ensured column stacking on small screens */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        
                        {/* Search Input (Center/Left) */}
                        {/* IMPROVED: Search takes full width on mobile, better ratio on larger screens */}
                        <div className="relative w-full sm:w-1/2 lg:w-2/5 order-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder={`Search listings...`}
                                className="w-full pl-10 pr-10 py-3 border-2 border-green-200 rounded-full focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                                disabled={isLoading}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            {searchTerm && (
                                <button 
                                    onClick={handleClearSearch} 
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-red-500 rounded-full"
                                    disabled={isLoading}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        {/* Filter and Create Button Group */}
                        {/* IMPROVED: This group now uses a single row on mobile, distributing the two buttons evenly */}
                        <div className='flex w-full sm:w-auto gap-3 sm:gap-x-5 order-2 sm:order-2'>
                            
                            {/* Filter Button */}
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                // IMPROVED: w-1/2 on mobile to sit next to Create button
                                className="flex items-center justify-center w-1/2 sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-green-50 transition-colors shadow-sm flex-shrink-0 text-sm sm:text-base"
                                disabled={isLoading}
                            >
                                <Filter className="w-5 h-5 mr-1 sm:mr-2" />
                                Filters
                                {(selectedCategory !== 'all' || sort !== 'latestToOldest') && (
                                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {/* Create New Listing Button (Right) */}
                            <Link href="/sell" className="w-1/2 sm:w-auto flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(34, 139, 34, 0.3)" }}
                                    whileTap={{ scale: 0.98 }}
                                    // IMPROVED: w-full for 1/2 of the mobile width
                                    className="flex items-center justify-center w-full px-4 sm:px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all shadow-md text-sm sm:text-base"
                                >
                                    <Plus className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                                    {/* IMPROVED: Shorten text on mobile */}
                                    <span className="hidden sm:inline">Create New Listing</span>
                                    <span className="inline sm:hidden">New Listing</span>
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
                {/* --------------------------------------------------- */}
                
                {/* Filter Modal Render */}
                <AnimatePresence>
                    {isFilterModalOpen && (
                        <FilterModal 
                            isOpen={isFilterModalOpen}
                            onClose={() => setIsFilterModalOpen(false)}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                            sort={sort}
                            onSortChange={handleSortChange}
                            getSortLabel={getSortLabel}
                        />
                    )}
                </AnimatePresence>
                
                {/* Error State */}
                {(listingsError || categoriesError) && (
                    <div className="p-5 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between my-8 shadow-inner space-y-3 sm:space-y-0">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
                            <p className="font-semibold text-sm">
                                {listingsError ? `Listings Error: ${JSON.stringify((listingsError as any).error) || 'Failed to fetch listings.'}` : 'Category Error. Filtering may be limited.'}
                            </p>
                        </div>
                        <button onClick={refetchListings} className="text-red-600 hover:text-red-800 flex items-center space-x-1 font-medium text-sm ml-auto sm:ml-0">
                            <RefreshCw className="w-4 h-4" />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-60 bg-white rounded-xl shadow-md my-8">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-3" />
                        <p className="text-xl font-medium text-gray-600">Loading {categoryTitle}...</p>
                    </div>
                ) : listings.length > 0 ? (
                    // Listings Grid 
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        // Unchanged grid classes are responsive
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {listings?.map((listing) => (
                            <AnimalCard 
                                key={listing._id}
                                title={listing.title}
                                price={listing.price} 
                                details={listing.location} 
                                image={listing.mainImage || "/placeholder.jpg"} 
                                link="#" 
                                onClick={() => handleCardClick(listing._id)}
                                isClickable={true} 
                            />
                        ))}
                    </motion.div>
                ) : (
                    // No Results State
                    <div className="text-center py-20 bg-white rounded-xl shadow-md my-8">
                        <AlertTriangle className="w-10 h-10 text-orange-500 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-gray-700">
                            No listings found for **"{debouncedSearchTerm}"** in "{categoryTitle}".
                        </p>
                        <p className="text-gray-500">Try adjusting your search or filters. 😔</p>
                    </div>
                )}

                {/* --- Pagination (Unchanged) --- */}
                {!isLoading && listings.length > 0 && totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        // IMPROVED: Allow flex-wrap on mobile for multi-row pagination
                        className="flex flex-wrap items-center justify-center mt-12 space-x-2 sm:space-x-3" 
                    >
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-3 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm disabled:opacity-30 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex flex-wrap justify-center space-x-1 mx-2">
                            {renderPaginationButtons()}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm disabled:opacity-30 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </div>
        </main>
    );
}