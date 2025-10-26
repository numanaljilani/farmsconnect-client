"use client";

import { useLogoutMutation } from "@/lib/api";
import { clearCredentials } from "@/lib/authSlice";
import { RootState } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Plus, Settings, User, X } from "lucide-react"; // Changed GiWheat to Leaf for better Tailwind icon integration
import { Roboto } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GiWheat } from "react-icons/gi"; // Kept GiWheat in case you prefer it
import { useDispatch, useSelector } from "react-redux";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "Market", href: "/market" },
];

const languages = [
  { name: "English", code: "en" },
  { name: "Hindi", code: "hi" },
  { name: "Tamil", code: "ta" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false); // Separated language dropdown state
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileOpen(false);
    setIsLanguageOpen(false);
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsLanguageOpen(false); // Close language menu when opening profile
  };
  
  const toggleLanguage = () => setIsLanguageOpen(!isLanguageOpen);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    setIsLanguageOpen(false); 
    // Placeholder: Implement language change logic
  };

  const handleSellClick = () => {
    if (!token) {
      router.push("/login");
    } else {
      router.push("/sell");
    }
    // Close mobile menu if open
    if (isMenuOpen) toggleMenu();
  };
  
  const handleMyListingsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!token) {
      e.preventDefault(); // Prevent navigation if not logged in
      router.push("/login");
    }
    // Close mobile menu if open
    if (isMenuOpen) toggleMenu();
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      dispatch(clearCredentials());
      router.push("/login");
    }
  };

  const currentLanguageName = languages.find((lang) => lang.code === selectedLanguage)?.name || "English";

  // Base style for navigation links
  const linkBaseStyle = "px-3 py-1 font-medium transition-colors border-b-2 border-transparent";
  const linkActiveStyle = "text-white border-white shadow-md";
  const linkInactiveStyle = "text-green-200 hover:text-white hover:border-green-300";

  return (
    <header className={`${roboto.className} fixed top-0 left-0 w-full bg-green-700 text-white  shadow-xl z-50`}>
      <div className="container mx-aut border min-w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left: Logo and Company Name (Always visible) */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-xl font-extrabold tracking-wide hover:text-green-100 transition-colors"
        >
          {/* Using a custom icon GiWheat with a green color for visibility */}
          <GiWheat className="w-7 h-7 text-white" /> 
          <h1 className="md:block hidden">FarmsConnect</h1>
          <h1 className="md:hidden block">Connect</h1> {/* Shorter name for mobile */}
        </Link>
        
        {/* Center: Nav Links (Desktop) */}
        <nav className="hidden md:flex space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${linkBaseStyle} ${
                pathname === link.href ? linkActiveStyle : linkInactiveStyle
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/my-listings"
            onClick={handleMyListingsClick}
            className={`${linkBaseStyle} ${
                pathname === "/my-listings" ? linkActiveStyle : linkInactiveStyle
            }`}
          >
            My Listings
          </Link>
        </nav>

        {/* Right: Actions and Profile/Auth */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Sell Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSellClick}
            className="flex items-center px-3 py-2 bg-yellow-400 text-green-800 rounded-full text-sm sm:text-base font-semibold hover:bg-yellow-300 transition-all shadow-md whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1" />
            Sell Now
          </motion.button>

          {/* Language Dropdown (Desktop) */}
          {/* <div className="relative hidden md:block">
            <button
                onClick={toggleLanguage}
                className="flex items-center p-2 rounded-full text-green-100 hover:bg-green-600 transition-colors"
                aria-expanded={isLanguageOpen}
            >
                <Globe className="w-5 h-5" />
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isLanguageOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-gray-800 origin-top-right"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-green-100 transition-colors ${
                                    selectedLanguage === lang.code ? "bg-green-100 font-semibold" : ""
                                }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
          </div> */}

          {/* Conditional Profile/Auth Buttons */}
          {token ? (
            <div className="relative hidden md:block">
              {/* Profile Dropdown Button (Desktop) */}
              <button
                onClick={toggleProfile}
                className={`p-2 rounded-full transition-colors ${
                    isProfileOpen ? "bg-green-600 text-white" : "text-white hover:bg-green-600"
                }`}
                aria-expanded={isProfileOpen}
              >
                <User className="w-6 h-6" />
              </button>

              {/* Profile Dropdown Content */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 text-gray-800 origin-top-right overflow-hidden"
                  >
                    {/* Update Profile Button */}
                    <button
                        onClick={() => { router.push("/profile/update"); setIsProfileOpen(false); }}
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        Update Profile
                    </button>
                    {/* My Listings Button */}
                    <button
                        onClick={() => { router.push("/my-listings"); setIsProfileOpen(false); }}
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-100 transition-colors border-y border-gray-100"
                    >
                        <Plus className="w-4 h-4 mr-3 text-gray-500" />
                        My Listings
                    </button>
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium hover:bg-red-50 text-red-600 transition-colors ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      {isLoading ? "Logging Out..." : "Logout"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Login/Signup Buttons (Desktop) - Combined into one button
            <Link 
                href="/login" 
                className="hidden md:flex items-center px-4 py-2 text-white bg-green-600 rounded-full border border-green-500 hover:bg-green-800 transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4 mr-1" />
              Login / Sign Up
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white hover:text-green-100 p-1"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-green-700 border-t border-green-600 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                
              {/* Primary Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={toggleMenu}
                  className={`text-lg py-1 hover:text-green-200 transition-colors ${
                    pathname === link.href ? "font-bold text-white border-l-4 border-white pl-2" : "text-green-100 pl-2"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* My Listings Link (Mobile) */}
              <Link
                href="/my-listings"
                onClick={handleMyListingsClick}
                className={`text-lg py-1 hover:text-green-200 transition-colors ${
                    pathname === "/my-listings" ? "font-bold text-white border-l-4 border-white pl-2" : "text-green-100 pl-2"
                }`}
              >
                My Listings
              </Link>

              {/* Conditional Auth Links/Profile Options in Mobile Menu */}
              {token ? (
                <div className="flex flex-col space-y-3 pt-4 border-t border-green-600">
                  <Link
                    href="/profile/update"
                    onClick={toggleMenu}
                    className="text-white text-base hover:text-green-200 transition-colors flex items-center font-medium"
                  >
                    <Settings className="w-5 h-5 mr-3 text-green-100" /> Update Profile
                  </Link>

                  {/* <div className="relative">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center text-white text-base hover:text-green-200 transition-colors w-full text-left font-medium"
                    >
                        <Globe className="w-5 h-5 mr-3 text-green-100" />
                        Language: <span className="font-semibold ml-1">{currentLanguageName}</span>
                        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isLanguageOpen && (
                        <div className="flex flex-col pl-8 mt-2 space-y-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => { handleLanguageChange(lang.code); }}
                                    className={`w-full text-left text-sm py-1 hover:text-green-200 transition-colors ${
                                        selectedLanguage === lang.code ? "font-semibold text-white" : "text-green-200"
                                    }`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    )}
                  </div> */}


                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    disabled={isLoading}
                    className={`text-red-300 text-base hover:text-red-100 transition-colors flex items-center w-full text-left font-medium ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    {isLoading ? "Logging Out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-4 border-t border-green-600">
                  <Link
                    href="/login"
                    onClick={toggleMenu}
                    className="text-white text-lg hover:text-green-200 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={toggleMenu}
                    className="text-white text-lg hover:text-green-200 transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}