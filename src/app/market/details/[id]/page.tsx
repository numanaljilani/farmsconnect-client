"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Flag,
    Heart,
    Loader2,
    MessageSquare,
    Phone,
    Share2
} from "lucide-react";
import React, { TouchEvent, useRef, useState } from "react";

// ====================================================================
// --- MOCKS FOR STANDALONE RUNNABILITY (Replace with actual imports in your project) ---
// Mock Next.js hooks/libs

const Link = ({ children, href, className }: any) => (
    <a href={href} className={className} onClick={(e) => { e.preventDefault(); console.log(`Navigating to ${href}`); }}>
        {children}
    </a>
);
const roboto = { className: "font-sans" }; // Mock font object

// Mock RTK Query hook (Replace with actual import from your apiSlice)
import { useGetListingDetailsQuery } from '@/lib/api';
import { useParams } from "next/navigation";
// ====================================================================

// --- Data Types (Based on the Controller Response) ---
interface SellerDetails {
    userId: string;
    name: string;
    contact: string;
}

interface ListingDetails {
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
    userId: SellerDetails;
    createdAt: string;
    unit?: string;
    status?: string;
}

interface ListingDetailsResponse {
    data: ListingDetails;
    message?: string;
    success?: boolean;
}

// Helper component for cleaner detail presentation
const DetailItem = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div className="border-b pb-2">
        <span className="font-medium text-gray-900">{label}:</span>{" "}
        <span className="text-gray-600">{value || 'N/A'}</span>
    </div>
);

// Main Component
export default function ListingDetailsPage() {
    const { id } = useParams();
       console.log( id, "ID")
    const listingId : string | undefined | any = id; 
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isReportSubmitted, setIsReportSubmitted] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false); 

    // Ref for tracking the initial touch position for swiping
    const touchStartX = useRef(0);
    const SWIPE_THRESHOLD = 50; // Minimum distance (in pixels) for a swipe to register

 
    // ✅ USE THE REAL API HOOK HERE
    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        error
    } = useGetListingDetailsQuery(listingId, {
        skip: !listingId // Skip if no listingId
    });

    const isPageLoading = isLoading || isFetching;
    const listing: ListingDetails | undefined | any = response?.data;
    // console.log(listing)

    // --- Conditional Rendering for Loading and Error States ---
    if (!listingId || isPageLoading) {
        return (
            <main className={`${roboto.className} w-full bg-green-50 text-gray-800 min-h-screen flex items-center justify-center pt-20`}>
                <div className="flex flex-col items-center p-8">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                    <p className="text-lg font-medium">Fetching Listing Details...</p>
                </div>
            </main>
        );
    }
    
    if (isError || !listing) {
        console.error("API Error:", error);
        
        // Handle different error types
        const errorStatus = (error as any)?.status;
        const errorMessage = error 
            ? (error as any)?.data?.message || (error as any)?.message || 'Unknown error occurred'
            : 'Listing not found';
            
        return (
            <main className={`${roboto.className} w-full bg-green-50 text-gray-800 min-h-screen px-4 py-12 pt-20`}>
                <div className="container mx-auto text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        {errorStatus === 404 ? 'Listing Not Found' : 'Error Loading Listing'}
                    </h1>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    <Link href="/market" className="text-green-600 hover:underline font-medium">
                        &larr; Back to Market
                    </Link>
                </div>
            </main>
        );
    }

    const images = [listing.mainImage, ...listing.additionalImages].filter(Boolean) as string[];

    // --- Image Carousel Logic ---
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // Native Touch Event Handlers
    const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        if (images.length <= 1) return;
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (images.length <= 1) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        // Swipe Left (Go to next image)
        if (diff > SWIPE_THRESHOLD) {
            handleNextImage();
        } 
        // Swipe Right (Go to previous image)
        else if (diff < -SWIPE_THRESHOLD) {
            handlePrevImage();
        }
    };
    // ----------------------------

    // --- Action Handlers ---
    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reportReason) {
            console.log("Reporting listing:", listing._id, "Reason:", reportReason);
            // You can add your report API call here
            setIsReportSubmitted(true);
            setReportReason("");
            setTimeout(() => {
                setIsReportSubmitted(false);
                setIsReportModalOpen(false);
            }, 2000);
        }
    };

    const handleFavoriteToggle = () => {
        setIsFavorite((prev) => !prev);
        // You can add your favorite API call here
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: listing.title,
                    text: listing.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const phoneLink = `tel:${listing?.userId?.contact}`;
    // ------------------------

    return (
        <main className={`${roboto.className} w-full  bg-green-50 text-gray-800 min-h-screen px-4 py-20 pt-8 sm:pt-12 relative`}>
            <div className="container mx-auto max-w-4xl pb-32 lg:pb-12"> 
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Back Link and Report Button (Top) */}
                    <div className="flex justify-between items-center mb-4 mt-10">
                        <Link href="/market" className="text-green-600 hover:text-green-700 inline-flex items-center font-medium">
                            <ChevronLeft className="w-5 h-5" /> Back to Market
                        </Link>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-white transition-colors flex items-center"
                        >
                            <Flag className="w-5 h-5 mr-1 sm:mr-0" />
                            <span className="hidden sm:inline text-sm">Report Listing</span>
                        </button>
                    </div>

                    {/* Listing Header */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{listing.title}</h1>
                    <p className="text-2xl font-bold text-green-700 mb-6">
                        ₹{listing.price.toLocaleString('en-IN')} {listing.unit ? `/${listing.unit}` : ''}
                    </p>

                    {/* Image Carousel with Native Touch Swipe */}
                    {images.length > 0 ? (
                        <div 
                            className="relative mb-6 cursor-pointer"
                            // Apply Native Touch Handlers here
                            onTouchStart={onTouchStart} 
                            onTouchEnd={onTouchEnd}
                        >
                            <div className="w-full h-72 sm:h-96 aspect-video overflow-hidden rounded-xl shadow-lg">
                                <AnimatePresence initial={false} mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={images[currentImageIndex]}
                                        alt={`${listing.title} image ${currentImageIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/800x600/cccccc/000000?text=Image+Unavailable";
                                        }}
                                    />
                                </AnimatePresence>
                            </div>
                            {/* Navigation Buttons */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-lg z-10 transition-all hover:scale-105"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-lg z-10 transition-all hover:scale-105"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-800" />
                                    </button>
                                    {/* Indicators */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/40 p-1.5 rounded-full shadow-inner">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                                    index === currentImageIndex ? "bg-green-400 scale-125" : "bg-gray-300/80 hover:bg-white/80"
                                                }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                                aria-label={`Go to image ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-72 sm:h-96 bg-gray-200 rounded-xl flex items-center justify-center mb-6 shadow-inner border border-dashed border-gray-400">
                            <span className="text-gray-500 font-medium text-lg">No Image Available</span>
                        </div>
                    )}

                    {/* Details and Seller Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Description</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">{listing.description}</p>
                            
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Product Info</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:text-base">
                                <DetailItem label="Category" value={listing.category} />
                                <DetailItem label="Subcategory" value={listing.subcategory} />
                                <DetailItem label="Location" value={listing.location} />
                                <DetailItem label="Quantity" value={`${listing.quantity} ${listing.unit || ''}`} />
                                <DetailItem label="Status" value={listing.status || 'Available'} />
                                <DetailItem label="Posted On" value={new Date(listing.createdAt).toLocaleDateString()} />
                            </div>
                        </div>

                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg space-y-4 h-fit border border-gray-200 sticky top-4">
                            <h2 className="text-xl font-bold border-b pb-2 text-gray-800">Seller Details</h2>
                            <div className="space-y-2">
                                <p className="text-lg font-medium text-gray-900">
                                    {listing?.userId?.name}
                                </p>
                                <p className="text-sm text-gray-500">Seller ID: {listing?.userId?.name?.slice(0, 8)}...</p>
                                <p className="text-sm text-gray-500">Member since: {(listing?.userId?.createdAt)?.split('T')[0]}</p>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "#3b82f6" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => console.log("Chat initiated:", listing._id)}
                                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Chat Now
                            </motion.button>

                            {/* Desktop/Tablet Call Button */}
                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href={phoneLink}
                                className="hidden lg:flex w-full items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl shadow-xl hover:bg-green-700 transition-colors font-bold text-lg"
                                aria-label="Call Seller"
                            >
                                <Phone className="w-6 h-6 mr-3" />
                                Call Seller
                            </motion.a>

                            {/* Favorite and Share Buttons (Desktop) */}
                            <div className="hidden lg:flex justify-between space-x-2 pt-2">
                                <motion.button
                                    onClick={handleFavoriteToggle}
                                    className={`flex-1 p-3 rounded-xl shadow-sm transition-colors flex items-center justify-center ${
                                        isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    aria-label="Toggle favorite"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : 'fill-gray-400'}`} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors font-semibold shadow-sm border"
                                >
                                    <Share2 className="w-5 h-5 mr-1" />
                                    Share
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- FLOATING ACTION BAR (Mobile/Bottom) --- */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl z-40 lg:hidden"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center space-x-3">
                    {/* Favorite Button (Floating) */}
                    <motion.button
                        onClick={handleFavoriteToggle}
                        className={`p-3 rounded-xl shadow-lg transition-colors ${
                            isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        aria-label="Toggle favorite"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart className="w-6 h-6 fill-current" />
                    </motion.button>
                    
                    {/* Call Button (Floating & Primary) */}
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        href={phoneLink}
                        className="flex-grow flex items-center justify-center py-3 bg-green-600 text-white rounded-xl shadow-xl hover:bg-green-700 transition-colors font-bold text-lg"
                        aria-label="Call Seller"
                    >
                        <Phone className="w-6 h-6 mr-3" />
                        Call Seller
                    </motion.a>
                </div>
            </motion.div>
            {/* ------------------------------------------- */}

            {/* Report Modal */}
            <AnimatePresence>
                {isReportModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsReportModalOpen(false)} 
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            {isReportSubmitted ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Report Submitted</h2>
                                    <p className="text-green-600 mb-6 flex items-center justify-center text-center">
                                        <CheckCircle className="w-6 h-6 mr-2" />
                                        Thank you for your report. It will be reviewed shortly.
                                    </p>
                                    <button
                                        onClick={() => setIsReportModalOpen(false)}
                                        className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Report Listing</h2>
                                    <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
                                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                                        Warning: Please provide a valid reason for reporting "{listing.title}" to help our moderation team.
                                    </p>
                                    <form onSubmit={handleReportSubmit}>
                                        <textarea
                                            value={reportReason}
                                            onChange={(e) => setReportReason(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mb-4 resize-none"
                                            placeholder="Enter reason for reporting (e.g., inappropriate content, listing sold, illegal item)..."
                                            rows={4}
                                            required
                                        />
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsReportModalOpen(false)}
                                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:bg-red-300"
                                                disabled={!reportReason.trim()}
                                            >
                                                Submit Report
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}