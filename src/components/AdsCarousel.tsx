"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { mockAds } from "@/lib/mockData";

export function AdsCarousel() {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % mockAds.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden rounded-lg">
      <AnimatePresence>
        <motion.div
          key={currentAd}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Link href={mockAds[currentAd].link}>
            <img
              src={mockAds[currentAd].image}
              alt={mockAds[currentAd].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">{mockAds[currentAd].title}</h3>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}