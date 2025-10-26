"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, CheckCircle, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Roboto } from "next/font/google";
import { useLoginMutation } from "@/lib/api";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/authSlice";

// Font setup
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const quotes = [
  { text: "Agriculture is the most healthful, most useful, and most noble employment of man.", author: "George Washington" },
  { text: "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.", author: "John F. Kennedy" },
  { text: "Farming looks mighty easy when your plow is a pencil and you're a thousand miles from the corn field.", author: "Dwight D. Eisenhower" },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  // Handle Google OAuth redirect
  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");
    if (token) {
      // Fetch profile to get user data
      fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            dispatch(setCredentials({ user: data.user, token }));
            setIsSubmitted(true);
            setTimeout(() => {
              setIsSubmitted(false);
              router.push("/");
            }, 3000);
          }
        })
        .catch((err) => console.error("Google OAuth Profile Error:", err));
    } else if (errorParam) {
      console.error("Google OAuth Error:", errorParam);
    }
  }, [searchParams, dispatch, router]);

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      setIsSubmitted(true);
      reset();
      setTimeout(() => {
        setIsSubmitted(false);
        router.push("/");
      }, 3000);
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  return (
    <main className={`${roboto.className} w-full bg-green-50 text-gray-800 min-h-screen pt-20 flex items-center justify-center`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-5xl lg:flex"
      >
        {/* Left: Image and Quote (Desktop) */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="/farm.jpg"
            alt="Farm Landscape"
            className="w-full h-[600px] object-cover rounded-l-lg"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center text-white p-6 max-w-md"
              >
                <p className="text-lg italic">"{quotes[currentQuoteIndex].text}"</p>
                <p className="text-sm mt-2 font-semibold">— {quotes[currentQuoteIndex].author}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-6 sm:p-8 rounded-lg lg:rounded-l-none shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
            Login to FarmsConnect
          </h1>

          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center bg-green-100 text-green-800 p-4 rounded-lg mb-6"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Login successful!
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center bg-red-100 text-red-800 p-4 rounded-lg mb-6"
            >
              {(error as any)?.data?.message || "Login failed"}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <input
                  {...register("email")}
                  className={`w-full p-2 pl-10 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } rounded focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full p-2 pl-10 border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } rounded focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </motion.button>

            {/* Google Login Button */}
            <motion.a
              href="http://localhost:5000/api/auth/google"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h1.92c-.08.44-.34 1.28-.84 1.88-.56.68-1.36 1.12-2.44 1.12-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4c.84 0 1.6.32 2.16.84l1.44-1.44C13.88 7.72 12.36 7 10.56 7 7.48 7 5 9.48 5 12.56s2.48 5.56 5.56 5.56c2.88 0 5.2-2.08 5.56-4.88h-5.64z" />
              </svg>
              Login with Google
            </motion.a>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-green-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}