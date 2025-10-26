// src/pages/MyListings.jsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  Power,
  Plus,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { AnimalCard } from "@/components/AnimalCard";
import { categories } from "@/lib/mockData"; // Keep categories for dropdown
import { Roboto } from "next/font/google";

// 1. IMPORT RTK QUERY HOOKS
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
  // Assuming the Listing type from your api.ts file
  // You should import the actual types if possible, otherwise redefine.
} from "@/lib/api"; // Adjust the import path to your api file

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// --- Types (Simplified/Aligned with API) ---
// Note: Category type is missing, assuming it's an array of { name: string, slug: string }
type StatusFilter = "all" | "active" | "deactivated";

// Re-defining the API's Listing interface for local component use
interface ListingType {
  _id: string; // Use _id from API
  userId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  location: string;
  mainImage: string;
  // Assuming 'status' is a field you manage via update
  status: 'active' | 'deactivated'; 
}

type ModalType = "update" | "delete" | "deactivate" | null;

// --- Component ---
export default function MyListings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Local State for UI and Filtering ---
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "all"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [modal, setModal] = useState<{
    type: ModalType;
    listing: ListingType | null;
  }>({ type: null, listing: null });

  const [updateForm, setUpdateForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
  });

  // --- RTK Query Hooks ---
  // The filter parameters will be managed locally and applied on the frontend
  // since the getMyListingsQuery takes no arguments (it is user-scoped).
  // If your API supported pagination/filtering on 'my' route, we'd pass it here:
  // const { data, isLoading, isFetching, error, refetch } = useGetMyListingsQuery(
  //   { page: currentPage, category: selectedCategory, search: search, status: selectedStatus } 
  // );

  // **Using RTK Query for Data Fetching**
  const { 
    data: listingsResponse, 
    isLoading: isListingsLoading, 
    isFetching: isListingsFetching, 
    error: listingsError 
  } = useGetMyListingsQuery();

  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();

  // --- Filtering and Pagination Logic (Now on Client-Side of RTK Data) ---
  const rawListings: ListingType[] | any = listingsResponse?.data || [];
  const itemsPerPage = 9;

  // Client-side filtering of RTK data (if API doesn't support it for /my route)
  let filteredListings = rawListings.filter((listing : any) => {
    // Category Filter
    if (selectedCategory !== "all" && listing.category !== selectedCategory) {
      return false;
    }
    // Status Filter
    if (selectedStatus !== "all" && listing.status !== selectedStatus) {
      return false;
    }
    // Search Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      if (
        !listing.title.toLowerCase().includes(lowerSearch) &&
        !listing.description.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(
    startIndex,
    startIndex + itemsPerPage
  );


  // --- URL and Page State Sync ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (search) params.set("search", search);
    
    // Reset page to 1 if the current page is out of bounds after filtering
    const pageToSet = currentPage > totalPages && totalPages > 0 ? 1 : currentPage;
    params.set("page", pageToSet.toString());
    
    router.push(`/my-listings?${params.toString()}`, { scroll: false });
    setCurrentPage(pageToSet); // Ensure local state reflects URL

  }, [currentPage, selectedCategory, selectedStatus, search, router, totalPages]);

  // --- Handlers ---

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  }, [totalPages]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setIsCategoryOpen(false);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    setIsStatusOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  
  const clearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  }

  const openModal = (type: ModalType, listing: ListingType) => {
    setModal({ type, listing });
    if (type === "update") {
      setUpdateForm({
        title: listing.title,
        price: listing.price.toString(),
        description: listing.description,
        category: listing.category,
      });
    }
  };

  const closeModal = () => setModal({ type: null, listing: null });

  // --- RTK Query Mutation Handlers ---

  const handleUpdate = async () => {
    if (!modal.listing) return;
    try {
      // NOTE: You'll likely need to handle image updates separately, 
      // but for this example, we only send text fields.
      const result = await updateListing({
        id: modal.listing._id,
        title: updateForm.title,
        price: parseFloat(updateForm.price),
        description: updateForm.description,
        category: updateForm.category,
        // Assuming other fields like mainImage, location are not updated here
      }).unwrap();
      console.log("Listing updated successfully:", result);
      closeModal();
      // RTK Query will automatically refetch 'getMyListingsQuery' due to tag invalidation!
    } catch (error) {
      console.error("Failed to update listing:", error);
      alert("Failed to update listing. Check console for details.");
    }
  };

  const handleDelete = async () => {
    if (!modal.listing) return;
    try {
      await deleteListing(modal.listing._id).unwrap();
      console.log("Listing deleted successfully:", modal.listing._id);
      closeModal();
      // RTK Query will automatically refetch 'getMyListingsQuery' due to tag invalidation!
    } catch (error) {
      console.error("Failed to delete listing:", error);
      alert("Failed to delete listing. Check console for details.");
    }
  };

  const handleDeactivate = async () => {
    if (!modal.listing) return;
    const newStatus = modal.listing.status === 'active' ? 'deactivated' : 'active';
    try {
      await updateListing({
        id: modal.listing._id,
        status: newStatus, // Send the new status
      }).unwrap();
      console.log(`Listing status changed to ${newStatus}:`, modal.listing._id);
      closeModal();
      // RTK Query will automatically refetch 'getMyListingsQuery' due to tag invalidation!
    } catch (error) {
      console.error("Failed to change listing status:", error);
      alert("Failed to change listing status. Check console for details.");
    }
  };


  // --- Render Conditional States (Loading/Error) ---

  const isDataLoading = isListingsLoading || isListingsFetching;
  const isActionLoading = isUpdating || isDeleting;


  if (listingsError) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600">Error Loading Listings</h2>
        <p className="text-gray-600">Could not fetch your listings. Please try again later.</p>
        <p className="text-sm text-gray-500 mt-2">Error: {JSON.stringify((listingsError as any)?.data || (listingsError as any)?.error)}</p>
      </div>
    );
  }

  // --- Render ---
  return (
    <main
      className={`${roboto.className} w-full bg-gray-50 text-gray-800 min-h-screen px-4 py-12 pt-20`}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
       

        {/* Search, Filters, and Action Button (Responsive Layout) */}
        <div className="flex flex-col gap-4 mb-10 p-4 bg-white shadow-lg rounded-xl">
          {/* ... (Search and New Listing Button - unchanged) ... */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-2/3">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-10 py-3 border-2 border-green-200 rounded-full focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              {search && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-red-500 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Create New Listing Button */}
            <Link href="/sell" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(34, 139, 34, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Listing
              </motion.button>
            </Link>
          </div>

          {/* Filters (Bottom Row on Mobile/Desktop) */}
          <div className="flex flex-wrap gap-4 sm:justify-start">
            
            {/* Category Filter */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full sm:w-48 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 hover:bg-green-50 transition-colors"
              >
                {selectedCategory === "all"
                  ? "All Categories"
                  : categories.find((cat) => cat.slug === selectedCategory)?.name || "All Categories"}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 w-full sm:w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                >
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-green-100 transition-colors ${selectedCategory === "all" ? "bg-green-200 font-semibold" : ""}`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-green-100 transition-colors ${selectedCategory === category.slug ? "bg-green-200 font-semibold" : ""}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center justify-between w-full sm:w-48 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 hover:bg-green-50 transition-colors"
              >
                {selectedStatus === "all" ? "All Statuses" : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
              </button>
              {isStatusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 w-full sm:w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl"
                >
                  {["all", "active", "deactivated"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as StatusFilter)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-green-100 transition-colors ${selectedStatus === status ? "bg-green-200 font-semibold" : ""}`}
                    >
                      {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {isDataLoading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
                <p className="text-xl font-semibold text-gray-600">Fetching Your Listings...</p>
            </div>
        ) : paginatedListings.length > 0 ? (
          /* Listings Grid */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
          >
            {paginatedListings.map((listing : any) => (
              <motion.div 
                key={listing._id} // Use _id from API
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative group hover:shadow-2xl transition-shadow duration-300 rounded-xl"
              >
                <AnimalCard
                  title={listing.title}
                  price={listing.price}
                  // Check the status field from the API response
                  details={`${listing.location} | Status: ${listing?.status?.toUpperCase()}`} 
                  image={listing.mainImage} // Use mainImage from API
                  link={`/market?listing=${listing._id}`} // Use _id for link
                />
                {/* Action Buttons Overlay */}
                <div className="absolute top-2 right-2 flex space-x-2 p-1 bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 transition-opacity">
                  <button
                    onClick={() => openModal("update", listing)}
                    className="p-1 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    title="Update"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openModal("delete", listing)}
                    className="p-1 text-red-600 rounded hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openModal("deactivate", listing)}
                    className={`p-1 rounded transition-colors ${listing.status === "active" ? "text-yellow-600 hover:bg-yellow-100" : "text-green-600 hover:bg-green-100"}`}
                    title={listing.status === "active" ? "Deactivate" : "Activate"}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* No Listings Found */
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <p className="text-2xl font-semibold text-gray-600 mb-4">No Listings Found 😔</p>
            <p className="text-gray-500">Try adjusting your filters or search term.</p>
            <Link href="/sell">
                  <button className="mt-6 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2 inline-block" /> Create Your First Listing
                  </button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-white border border-gray-300 disabled:opacity-50 hover:bg-green-100 transition-colors shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <span className="text-base font-medium text-gray-700">
              Page <span className="font-bold text-green-700">{currentPage}</span> of {totalPages}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-white border border-gray-300 disabled:opacity-50 hover:bg-green-100 transition-colors shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        {/* --- Modals/Dialogs --- */}
        <AnimatePresence>
          {modal.type && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={closeModal} 
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
                
                {/* Update Dialog */}
                {modal.type === "update" && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-green-700 border-b pb-2">✏️ Update Listing</h2>
                    <p className="text-sm text-gray-500 mb-6">Modify the details for your listing: <span className="font-semibold">{modal.listing?.title}</span></p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={updateForm.title}
                          onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={updateForm.price}
                          onChange={(e) => setUpdateForm({ ...updateForm, price: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={updateForm.description}
                          onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={updateForm.category}
                          onChange={(e) => setUpdateForm({ ...updateForm, category: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 mt-8">
                      <button 
                        onClick={closeModal}
                        className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                        disabled={isActionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        disabled={isActionLoading}
                      >
                        {isUpdating ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Edit className="w-5 h-5 mr-2" />
                        )}
                        {isUpdating ? 'Updating...' : 'Save Changes'}
                      </button>
                    </div>
                  </>
                )}

                {/* Delete Dialog */}
                {modal.type === "delete" && (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-red-600 border-b pb-2">🗑️ Delete Listing</h2>
                    <p className="text-lg mb-6 text-gray-700">Are you sure you want to permanently delete "{modal.listing?.title}"?</p>
                    <p className="text-sm text-gray-500 mb-6">This action cannot be undone and will remove the listing from the marketplace.</p>

                    <div className="flex justify-end space-x-4 mt-8">
                      <button 
                        onClick={closeModal}
                        className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                        disabled={isActionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-red-400"
                        disabled={isActionLoading}
                      >
                        {isDeleting ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Trash className="w-5 h-5 mr-2" />
                        )}
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </>
                )}

                {/* Deactivate/Activate Dialog */}
                {modal.type === "deactivate" && modal.listing && (
                    <>
                    <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${modal.listing.status === 'active' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {modal.listing.status === 'active' ? '🛑 Deactivate Listing' : '✅ Activate Listing'}
                    </h2>
                    <p className="text-lg mb-6 text-gray-700">
                        {modal.listing.status === 'active'
                            ? `Do you want to deactivate "${modal.listing.title}"? It will be hidden from the public market.`
                            : `Do you want to re-activate "${modal.listing.title}"? It will be visible in the market again.`
                        }
                    </p>
                    <p className="text-sm text-gray-500 mb-6">Current Status: <span className="font-semibold">{modal.listing?.status?.toUpperCase()}</span></p>

                    <div className="flex justify-end space-x-4 mt-8">
                      <button 
                        onClick={closeModal}
                        className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                        disabled={isActionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeactivate}
                        className={`flex items-center px-6 py-3 text-white rounded-full transition-colors disabled:opacity-50 ${modal.listing.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                        disabled={isActionLoading}
                      >
                        {isUpdating ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Power className="w-5 h-5 mr-2" />
                        )}
                        {isUpdating 
                            ? (modal.listing.status === 'active' ? 'Deactivating...' : 'Activating...')
                            : (modal.listing.status === 'active' ? 'Confirm Deactivate' : 'Confirm Activate')
                        }
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}