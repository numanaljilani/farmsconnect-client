import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "./authSlice";
import { Category, ListingDetailsResponse } from "@/types";

// --- New Interface for Listing and Listing Filter/Search ---

interface Listing {
  _id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  location: string;
  mainImage: string;
  // Add other fields as necessary
}

interface ListingsResponse {
    success: boolean;
    count: number;
    data: Listing[];
}

interface UpdateListingRequest extends Partial<Listing> {
    id: string; // ID is required for update
}

interface ListingFilterParams {
    search?: string;
    category?: string;
    subcategory?: string;
    sortBy?: 'price' | 'date';
    priceOrder?: 'lowToHigh' | 'highToLow';
    dateOrder?: 'latestToOldest' | 'oldestToLatest';
    lat?: number;
    lng?: number;
    radius?: number; // In kilometers
}

// --- Original Code with New APIs Added ---

interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://farmsconnect-server-01.vercel.app/api/",
    // baseUrl: "http://localhost:5000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Note: RTK Query correctly handles FormData headers (multipart/form-data)
      // so we don't need to manually set 'Content-Type': 'application/json' for all requests.
      return headers;
    },
  }),
  // Tagging is crucial for automatic refetching after mutations
  tagTypes: ['Listing', 'Category'],
  endpoints: (builder) => ({
    // Authentication Endpoints (Existing)
    signup: builder.mutation<AuthResponse, FormData>({
      query: (formData) => ({ url: "auth/signup", method: "POST", body: formData }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: data.token }));
        } catch (error) { console.error("Signup error:", error); }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({ url: "auth/login", method: "POST", body: credentials }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: data.token }));
        } catch (error) { console.error("Login error:", error); }
      },
    }),
    getProfile: builder.query<AuthResponse, void>({
      query: () => "auth/profile",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch( setCredentials({ user: data.user, token: (data as any).token || null }) );
        } catch (error) { console.error("Profile error:", error); }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCredentials());
        } catch (error) { console.error("Logout error:", error); }
      },
    }),

    // Category Endpoints (Existing)
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
      providesTags: ['Category'],
    }),
    createCategories: builder.mutation<
      any,
      { categories: Array<{ name: string; slug: string; icon: string }> }
    >({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<
      any,
      { id: string; name: string; slug: string; icon?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PUT", body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ['Category'],
    }),

    // =========================================================
    // LISTING ENDPOINTS (NEW)
    // =========================================================

    // 1. CREATE LISTING (Mutation)
    createListing: builder.mutation<Listing, FormData>({
      query: (formData) => ({
        url: "/listings", // Matches POST /api/listings route
        method: "POST",
        body: formData,
      }),
      // Invalidates both 'My Listings' and potentially the main list cache
      invalidatesTags: ['Listing'],
    }),

    // 2. GET ALL LISTINGS (Query - Search/Filter)
    getListings: builder.query<ListingsResponse, ListingFilterParams>({
      query: (params) => ({
        url: "/listings", // Matches GET /api/listings route
        method: "GET",
        params: params, // Automatically appends query parameters
      }),
      providesTags: (result) => 
        result ? [
            ...result.data.map(({ _id }) => ({ type: 'Listing' as const, id: _id })),
            { type: 'Listing', id: 'LIST' },
        ]
        : [{ type: 'Listing', id: 'LIST' }],
    }),

    // 3. GET MY LISTINGS (Query)
    getMyListings: builder.query<ListingsResponse, void>({
      query: () => "/listings/my", // Matches GET /api/listings/my route
      providesTags: (result) => 
        result ? [
            ...result.data.map(({ _id }) => ({ type: 'Listing' as const, id: _id })),
            { type: 'Listing', id: 'MY_LIST' }, // Specific tag for my listings
        ]
        : [{ type: 'Listing', id: 'MY_LIST' }],
    }),

    // 4. UPDATE LISTING (Mutation)
    updateListing: builder.mutation<Listing, UpdateListingRequest | any>({
        query: ({ id, ...body }) => ({
            url: `/listings/${id}`, // Matches PUT /api/listings/:id route
            method: "PUT",
            body: body,
        }),
        // Invalidates the specific item and both list types
        invalidatesTags: (result, error, { id }) => [
            { type: 'Listing', id }, 
            { type: 'Listing', id: 'LIST' }, 
            { type: 'Listing', id: 'MY_LIST' }
        ],
    }),

    // 5. DELETE LISTING (Mutation)
    deleteListing: builder.mutation<void, string>({
        query: (id) => ({
            url: `/listings/${id}`, // Matches DELETE /api/listings/:id route
            method: "DELETE",
        }),
        // Invalidates both list types globally
        invalidatesTags: ['Listing'],
    }),

    getListingDetails: builder.query<ListingDetailsResponse, string>({
      /**
       * @param {string} listingId - The ID of the listing passed from the frontend (useParams).
       * @returns {object} The request configuration.
       */
      query: (listingId) => ({
        // This maps directly to your Express route: GET /api/listings/:listingId
        url: `/listings/${listingId}`, 
      }),
      // Select the 'data' property from the response for simpler component usage
      transformResponse: (response: ListingDetailsResponse) => response, 
    }),
  

  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGetProfileQuery,
  useLogoutMutation,

  useGetCategoriesQuery,
  useCreateCategoriesMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Export NEW Listing Hooks
  useCreateListingMutation,
  useGetListingsQuery,
  useGetMyListingsQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useGetListingDetailsQuery
} = api;