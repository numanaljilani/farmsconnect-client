"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Tag,
  Hash,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Roboto } from "next/font/google";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useCreateListingMutation, useGetCategoriesQuery } from "@/lib/api";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// Zod schema for form validation - UPDATED for better FileList handling
const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  price: z.number().positive("Price must be greater than zero"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters").optional().or(z.literal('')),
  quantity: z.number().int().positive("Quantity must be a positive whole number"),
  
  // Use FileList to correctly check against the browser input type
  mainImage: z.instanceof(FileList).refine((files) => files.length === 1, "Main image is required"),
  additionalImages: z.instanceof(FileList).refine((files) => files.length <= 4, "Maximum 4 additional images").optional().or(z.literal('')),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

// --- Components for Reusability and Clarity ---

// Form Input Field Component
const FormField = ({ id, label, icon: Icon, error, ...props }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`w-5 h-5 ${error ? "text-red-500" : "text-green-500"}`} />
      </div>
      <input
        id={id}
        className={`w-full pl-10 pr-4 py-3 border ${
          error ? "border-red-400 ring-red-500" : "border-gray-300 focus:ring-green-600"
        } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400`}
        {...props}
      />
    </div>
    {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">{error.message}</motion.p>}
  </div>
);

// Form Select Field Component
const FormSelect = ({ id, label, icon: Icon, error, children, ...props }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`w-5 h-5 ${error ? "text-red-500" : "text-green-500"}`} />
      </div>
      <select
        id={id}
        className={`w-full pl-10 pr-4 py-3 border appearance-none ${
          error ? "border-red-400 ring-red-500" : "border-gray-300 focus:ring-green-600"
        } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-gray-700`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
    {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">{error.message}</motion.p>}
  </div>
);

// --- Main Component ---

export default function Sell() {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  
  // RTK Query: Fetch Categories
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();
  
  // RTK Query: Create Listing Mutation
  const [
    createListing, 
    { 
      isLoading: isSubmitting, 
      error: submissionError 
    }
  ] = useCreateListingMutation();
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
    setValue,
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    mode: "onTouched",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Handle main image preview and form value update
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      setMainImagePreview(URL.createObjectURL(files[0]));
      setValue("mainImage", files, { shouldValidate: true, shouldDirty: true });
    }
  };

  // Handle additional images preview and form value update
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Clean up existing URLs
      additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      
      const fileArray = Array.from(files);
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      
      setAdditionalImagePreviews(newPreviews.slice(0, 4)); // Limit to 4 for previews
      setValue("additionalImages", files, { shouldValidate: true, shouldDirty: true });
    }
  };

  // Clean up object URLs to prevent memory leaks (runs on unmount)
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mainImagePreview, additionalImagePreviews]);

  const selectedCategory = watch("category");

  // Filter subcategories based on selected category
  //@ts-ignore
  const filteredSubcategories =categories?.find((cat: any) => cat.slug === selectedCategory)?.subcategories || [];

  const onSubmit = async (data: CreateListingFormData) => {
    if (isSubmitting) return;

    try {
      const formData = new FormData();
      // Append non-file fields
      formData.append("title", data.title);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      formData.append("location", data.location);
      formData.append("description", data.description || "");
      formData.append("quantity", data.quantity.toString());
      
      // Append files
      if (data.mainImage.length > 0) formData.append("mainImage", data.mainImage[0]);
      
      if (data.additionalImages && data.additionalImages.length > 0) {
        // Ensure we only append up to 4 files
        Array.from(data.additionalImages).slice(0, 4).forEach((file: any) => formData.append("additionalImages", file));
      }

      // === API CALL ===
      await createListing(formData).unwrap();
      // ================
      
      setIsSubmitted(true);
      
      // Clear all state and form fields
      reset(); 
      if (mainImageInputRef.current) mainImageInputRef.current.value = "";
      if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = "";
      setMainImagePreview(null);
      setAdditionalImagePreviews([]);

      setTimeout(() => {
        setIsSubmitted(false);
        router.push("/my-listings");
      }, 3000);
    } catch (err) {
      console.error("Create Listing Error:", err);
      // RTK Query error handling often includes `status` or `data`
    }
  };

  const isFormDisabled = isSubmitting || isCategoriesLoading || isSubmitted;

  return (
    <main
      className={`${roboto.className} w-full bg-gray-50 text-gray-800 min-h-screen px-4 py-12 pt-20 flex justify-center`}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-extrabold text-green-700 tracking-tight sm:text-5xl">
            List Your Produce 🥕
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Showcase your fresh, local goods to the community.
          </p>
        </motion.header>

        {/* Status Messages */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 shadow-lg"
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              <span className="font-medium">Listing created successfully!</span> Redirecting to your listings...
            </motion.div>
          )}

          {(submissionError || categoriesError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 shadow-lg"
            >
              <AlertTriangle className="w-6 h-6 mr-3" />
              <span className="font-medium">Error:</span>{" "}
              {(submissionError as any)?.data?.message || (categoriesError as any)?.data?.message || "Failed to process request."}
            </motion.div>
          )}

          {isCategoriesLoading && (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-3 text-green-600 font-medium">Loading categories...</span>
            </div>
          )}
        </AnimatePresence>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Image Upload Section */}
            <div className="p-6 bg-green-50 rounded-xl border border-green-100 shadow-inner">
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                <ImageIcon className="w-6 h-6 mr-2" /> Product Images
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                A great main image is key! Add up to four additional images for details.
              </p>

              {/* Main Image */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main Image <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => mainImageInputRef.current?.click()}
                    className={`relative w-64 h-64 bg-white rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ${
                      errors.mainImage ? "border-2 border-red-500" : "border-2 border-dashed border-green-300 hover:border-green-500"
                    }`}
                  >
                    {mainImagePreview ? (
                      <img
                        src={mainImagePreview}
                        alt="Main Image Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-green-500 p-4">
                        <Upload className="w-10 h-10 mx-auto mb-3" />
                        <p className="text-sm font-medium">Click to upload main image</p>
                        <p className="text-xs text-gray-400 mt-1">1:1 aspect ratio recommended</p>
                      </div>
                    )}
                  </motion.div>
                </div>
                <input
                  type="file"
                  {...register("mainImage")}
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isFormDisabled}
                />
                {errors.mainImage && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {(errors.mainImage as any).message}
                  </p>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Images (Up to 4)
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => additionalImagesInputRef.current?.click()}
                      className="relative w-full aspect-square bg-white rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border border-dashed border-gray-300 hover:border-green-400 transition-colors"
                    >
                      {additionalImagePreviews[index] ? (
                        <img
                          src={additionalImagePreviews[index]}
                          alt={`Additional Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ImageIcon className="w-5 h-5 mx-auto" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  {...register("additionalImages")}
                  ref={additionalImagesInputRef}
                  onChange={handleAdditionalImagesChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isFormDisabled}
                />
                {errors.additionalImages && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {(errors.additionalImages as any).message}
                  </p>
                )}
              </div>
            </div>

            {/* General Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <FormField
                id="title"
                label="Product Title"
                icon={Tag}
                type="text"
                error={errors.title}
                placeholder="e.g., Organic Honeycomb"
                {...register("title")}
                disabled={isFormDisabled}
              />

              {/* Price */}
              <FormField
                id="price"
                label="Price (₹)"
                icon={DollarSign}
                type="number"
                error={errors.price}
                placeholder="e.g., 50.00"
                min="0"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                disabled={isFormDisabled}
              />

              {/* Category */}
              <FormSelect
                id="category"
                label="Category"
                icon={ShoppingBag}
                error={errors.category}
                {...register("category")}
                disabled={isFormDisabled || isCategoriesLoading}
              >
                <option value="">Select Category</option>
                {categories?.map((cat: any) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </FormSelect>

              {/* Subcategory */}
              <FormSelect
                id="subcategory"
                label="Subcategory"
                icon={Tag}
                error={errors.subcategory}
                {...register("subcategory")}
                disabled={!selectedCategory || isFormDisabled}
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </FormSelect>

              {/* Quantity */}
              <FormField
                id="quantity"
                label="Available Quantity"
                icon={Hash}
                type="number"
                error={errors.quantity}
                placeholder="e.g., 100 kg"
                min="1"
                step="1"
                {...register("quantity", { valueAsNumber: true })}
                disabled={isFormDisabled}
              />

              {/* Location */}
              <FormField
                id="location"
                label="Location (City/Region)"
                icon={MapPin}
                type="text"
                error={errors.location}
                placeholder="e.g., Bengaluru, Karnataka"
                {...register("location")}
                disabled={isFormDisabled}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Description (Optional but Recommended)
              </label>
              <textarea
                id="description"
                {...register("description")}
                className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors bg-white placeholder-gray-400"
                placeholder="Share details about your product: its quality, freshness, harvest time, and unique selling points."
                rows={5}
                disabled={isFormDisabled}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 10px 20px -5px rgba(34, 197, 94, 0.4)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isFormDisabled || !isDirty || !isValid}
              className={`w-full px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 flex items-center justify-center tracking-wide ${
                isFormDisabled || !isDirty || !isValid
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed shadow-none"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processing Listing...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-3" />
                  Finalize & Create Listing
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}