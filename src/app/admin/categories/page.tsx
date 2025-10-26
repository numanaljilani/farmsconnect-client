"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash,
  CheckCircle,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  PlusCircle,
  Pencil,
} from "lucide-react";
import { Roboto } from "next/font/google";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  useGetCategoriesQuery,
  useCreateCategoriesMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/lib/api";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// --- Zod Schemas ---
const subcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
});

const categorySchema = z.object({
  _id: z.string().optional(), // Added for update functionality
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  icon: z.string().optional().or(z.literal("")),
  units: z.string().optional().or(z.literal("")), // Added units field
  subcategories: z.array(subcategorySchema).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type Category = {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  units?: string; // Updated type
  subcategories?: string[];
};

// --- Modal/Dialog Component for Create and Update ---

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Category | null;
  refetch: () => void;
}

const CategoryDialog = ({
  isOpen,
  onClose,
  initialData,
  refetch,
}: CategoryDialogProps) => {
  const isUpdate = !!initialData?._id;

  const [createCategories, { isLoading: isCreating }] =
    useCreateCategoriesMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          ...initialData,
          subcategories: initialData.subcategories?.map((name) => ({ name })),
        }
      : {
          name: "",
          slug: "",
          icon: "",
          units: "", // Default value for new field
          subcategories: [],
        },
  });

  const {
    fields: subFields,
    append: appendSub,
    remove: removeSub,
  } = useFieldArray({ control, name: "subcategories" });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          subcategories: initialData.subcategories?.map((name) => ({ name })),
        });
      } else {
        // Reset for create
        reset({
          name: "",
          slug: "",
          icon: "",
          units: "",
          subcategories: [],
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload: any = {
        ...data,
        subcategories: data.subcategories?.map((sub) => sub.name) || [],
      };

      if (isUpdate && payload._id) {
        // Update existing category
        await updateCategory({ id: payload._id, ...payload }).unwrap();
      } else {
        // Create new category
        // The createCategories mutation expects an array of categories
        const createPayload = {
          categories: [payload],
        };
        await createCategories(createPayload).unwrap();
      }

      refetch();
      onClose();
    } catch (err) {
      console.error(
        isUpdate ? "Update Category Error:" : "Create Category Error:",
        err
      );
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-bold text-green-800">
                {isUpdate ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name*
                  </label>
                  <input
                    {...register("name")}
                    className={`w-full p-3 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors mt-1`}
                    placeholder="e.g., Eggs"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug*
                  </label>
                  <input
                    {...register("slug")}
                    className={`w-full p-3 border ${
                      errors.slug ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors mt-1`}
                    placeholder="e.g., eggs"
                    disabled={isLoading}
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                {/* Units */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Units (String)
                  </label>
                  <input
                    {...register("units")}
                    className={`w-full p-3 border ${
                      errors.units ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors mt-1`}
                    placeholder="e.g., Dozen"
                    disabled={isLoading}
                  />
                  {errors.units && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.units.message}
                    </p>
                  )}
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Icon (Optional)
                  </label>
                  <input
                    {...register("icon")}
                    className={`w-full p-3 border ${
                      errors.icon ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors mt-1`}
                    placeholder="e.g., Egg"
                    disabled={isLoading}
                  />
                  {errors.icon && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.icon.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700">
                  Subcategories
                </label>
                {subFields.map((subField, subIndex) => (
                  <motion.div
                    key={subField.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      {...register(
                        `subcategories.${subIndex}.name` as const
                      )}
                      className={`w-full p-2 border ${
                        errors.subcategories?.[subIndex]?.name
                          ? "border-red-500"
                          : "border-gray-200"
                      } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm`}
                      placeholder="e.g., Chicken Eggs"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => removeSub(subIndex)}
                      className="text-red-600 hover:text-red-800 p-1"
                      disabled={isLoading}
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
                {errors.subcategories && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subcategories.message}
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => appendSub({ name: "" })}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subcategory
                </motion.button>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-center font-semibold ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isUpdate ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isUpdate ? (
                      <Save className="w-5 h-5 mr-2" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    {isUpdate ? "Save Changes" : "Create Category"}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main AdminCategories Component ---

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);

  const {
    data: categories,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting, error: deleteError }] =
    useDeleteCategoryMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const handleCreateClick = () => {
    setCurrentCategory(null); // Clear data for new creation
    setIsDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category); // Set data for editing
    setIsDialogOpen(true);
  };

  const onDelete = async (id: string, name: string) => {
    if (
      confirm(`Are you sure you want to delete the category: "${name}"?`)
    ) {
      try {
        await deleteCategory(id).unwrap();
        refetch();
      } catch (err) {
        console.error("Delete Category Error:", err);
      }
    }
  };

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentCategory(null);
  }, []);

  // Removed old react-hook-form logic for bulk creation and moved form logic to dialog

  return (
    <main
      className={`${roboto.className} w-full bg-gray-50 text-gray-800 min-h-screen px-4 py-12 pt-20`}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center mb-8 text-green-700 tracking-tight"
        >
          Manage Product Categories 📦
        </motion.h1>

        {/* Error Messages */}
        {(fetchError || deleteError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center bg-red-100 text-red-800 p-4 rounded-lg mb-6 shadow-md"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {(fetchError as any)?.data?.message ||
              (deleteError as any)?.data?.message ||
              "An error occurred"}
          </motion.div>
        )}

        {/* --- Create Category Button --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-end mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateClick}
            className="flex items-center px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Category
          </motion.button>
        </motion.div>

        {/* --- Categories List / Table --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <h2 className="text-2xl font-semibold p-6 border-b text-gray-800">
            Existing Categories
          </h2>
          {isFetching ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-lg text-gray-600">Loading categories...</span>
            </div>
          ) : categories?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Subcategories
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category: Category | any) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-green-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                        <span className="block text-xs text-gray-500 sm:hidden">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {category.units || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden lg:table-cell">
                        {category.subcategories?.join(", ") || "None"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditClick(category)}
                          disabled={isDeleting}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors mr-2 disabled:opacity-50"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(category._id, category.name)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash className="w-5 h-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">
              No categories found. Click "Create New Category" to add one.
            </p>
          )}
        </motion.div>
      </div>

      {/* The Dialog Box */}
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        initialData={currentCategory}
        refetch={refetch}
      />
    </main>
  );
}