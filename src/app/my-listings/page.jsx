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
import { Roboto } from "next/font/google";

// RTK Query Hooks
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
} from "@/lib/api";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// --- Component ---
export default function MyListings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Filter State ---
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get("page") || "1", 10),
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    status: searchParams.get("status") || "all",
    sortBy: searchParams.get("sortBy") || "createdAt",
    order: searchParams.get("order") || "desc",
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [modal, setModal] = useState({ type: null, listing: null });
  const [updateForm, setUpdateForm] = useState({});

  // --- RTK Query ---
  const {
    data: response,
    isLoading: isLoadingListings,
    isFetching,
    error,
  } = useGetMyListingsQuery(filters);

  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();

  const listings = response?.data || [];
  const pagination = response?.pagination || {};
  const totalPages = pagination.pages || 1;

  // --- Sync URL with Filters ---
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "createdAt" && value !== "desc") {
        params.set(key, value.toString());
      }
    });
    router.push(`/my-listings?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // --- Handlers ---
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : prev.page,
    }));
  };

  const handlePageChange = (page) => updateFilter("page", page);

  const openModal = (type, listing) => {
    setModal({ type, listing });
    if (type === "update") {
      setUpdateForm({
        title: listing.title,
        price: listing.price.toString(),
        description: listing.description || "",
        category: listing.category,
      });
    }
  };

  const closeModal = () => setModal({ type: null, listing: null });

  const handleUpdate = async () => {
    if (!modal.listing) return;
    try {
      await updateListing({
        id: modal.listing._id,
        ...updateForm,
        price: parseFloat(updateForm.price),
      }).unwrap();
      closeModal();
    } catch (err) {
      alert("Update failed. Check console.");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!modal.listing) return;
    try {
      await deleteListing(modal.listing._id).unwrap();
      closeModal();
    } catch (err) {
      alert("Delete failed.");
      console.error(err);
    }
  };

  const handleToggleStatus = async () => {
    if (!modal.listing) return;
    const newStatus = modal?.listing?.status === "active" ? "deactivated" : "active";
    try {
      await updateListing({
        id: modal.listing._id,
        status: newStatus,
      }).unwrap();
      closeModal();
    } catch (err) {
      alert("Status change failed.");
      console.error(err);
    }
  };

  // --- Loading & Error States ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600">Failed to Load Listings</h2>
        <p className="text-gray-600 mt-2">Please try again later.</p>
      </div>
    );
  }

  const isLoading = isLoadingListings || isFetching;

  return (
    <main className={`${roboto.className} bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen py-12 pt-20`}>
      <div className="container mx-auto max-w-7xl px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-green-800">My Listings</h1>
          <p className="text-green-600 mt-2">Manage and track your farm products</p>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {filters.search && (
                <button
                  onClick={() => updateFilter("search", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-green-50 transition"
              >
                <span>{filters.category === "all" ? "All Categories" : filters.category}</span>
                <ChevronDown className={`w-4 h-4 transition ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {["all", "poultry", "dairy", "crops", "equipment"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        updateFilter("category", cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-green-100 ${filters.category === cat ? "bg-green-200 font-medium" : ""}`}
                    >
                      {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-green-50 transition"
              >
                <span>{filters.status === "all" ? "All Status" : filters.status}</span>
                <ChevronDown className={`w-4 h-4 transition ${isStatusOpen ? "rotate-180" : ""}`} />
              </button>
              {isStatusOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg">
                  {["all", "active", "deactivated"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        updateFilter("status", s);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-green-100 ${filters.status === s ? "bg-green-200 font-medium" : ""}`}
                    >
                      {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create Button */}
            <Link href="/sell" className="lg:col-span-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <Plus className="w-5 h-5" />
                New Listing
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-xl text-gray-600">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Listings Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting filters or create a new listing.</p>
            <Link href="/sell">
              <button className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
                <Plus className="w-5 h-5 inline mr-2" />
                Create Listing
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Listings Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {listings.map((listing) => (
                <motion.div
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <AnimalCard
                    title={listing.title}
                    price={listing.price}
                    details={`${listing.location} • ${listing.subcategory}`}
                    image={listing.mainImage}
                    link={`/listing/${listing._id}`}
                  />

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal("update", listing)}
                      className="p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal("delete", listing)}
                      className="p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal("deactivate", listing)}
                      className={`p-2 text-white rounded-full shadow-md ${
                        listing?.status === "active" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                      }`}
                      title={listing?.status === "active" ? "Deactivate" : "Activate"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    listing?.status === "active" ? "bg-green-600" : "bg-gray-500"
                  }`}>
                    {listing?.status?.toUpperCase()}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-3 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-green-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="px-4 py-2 bg-white rounded-full shadow-md font-medium">
                  Page {filters.page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="p-3 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-green-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modals */}
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
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>

                {/* Update Modal */}
                {modal.type === "update" && (
                  <>
                    <h2 className="text-2xl font-bold text-green-700 mb-6">Edit Listing</h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={updateForm.title || ""}
                        onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                        placeholder="Title"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        value={updateForm.price || ""}
                        onChange={(e) => setUpdateForm({ ...updateForm, price: e.target.value })}
                        placeholder="Price (₹)"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <textarea
                        value={updateForm.description || ""}
                        onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={closeModal} className="px-5 py-2 border rounded-lg hover:bg-gray-100">
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  </>
                )}

                {/* Delete Modal */}
                {modal.type === "delete" && (
                  <>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Listing?</h2>
                    <p className="text-gray-700 mb-6">This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                      <button onClick={closeModal} className="px-5 py-2 border rounded-lg hover:bg-gray-100">
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {/* Status Toggle */}
                {modal.type === "deactivate" && (
                  <>
                    <h2 className={`text-2xl font-bold mb-4 ${modal.listing?.status === 'active' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {modal.listing?.status === 'active' ? 'Deactivate' : 'Activate'} Listing
                    </h2>
                    <p className="text-gray-700 mb-6">
                      {modal.listing?.status === 'active'
                        ? 'This listing will be hidden from buyers.'
                        : 'This listing will be visible to buyers again.'}
                    </p>
                    <div className="flex justify-end gap-3">
                      <button onClick={closeModal} className="px-5 py-2 border rounded-lg hover:bg-gray-100">
                        Cancel
                      </button>
                      <button
                        onClick={handleToggleStatus}
                        disabled={isUpdating}
                        className={`px-5 py-2 text-white rounded-lg flex items-center gap-2 ${
                          modal.listing?.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                        Confirm
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