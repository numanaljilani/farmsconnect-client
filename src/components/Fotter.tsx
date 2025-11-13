"use client";

import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Leaf,
  Copyright 
} from "lucide-react";
import { Roboto } from "next/font/google";
import Link from "next/link";

const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["400", "700"] 
});

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Sell Produce", href: "/sell" },
    { name: "My Listings", href: "/my-listings" },
    { name: "Categories", href: "/categories" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/farmsconnect", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/farmsconnect", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/farmsconnect", label: "Instagram" },
  ];

  return (
    <footer className={`${roboto.className} bg-green-800 text-white`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <Leaf className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="text-2xl font-bold tracking-tight">farmsconnect.in</span>
            </Link>
            <p className="text-green-200 text-sm max-w-xs">
              Connecting farmers directly to buyers. Fresh produce, fair prices, sustainable future.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-green-700 p-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 text-green-300">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link 
                    href={link.href}
                    className="text-green-100 hover:text-white transition-colors text-sm flex items-center"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 text-green-300">Contact Us</h3>
            <div className="space-y-3 text-sm text-green-100">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:support@farmsconnect.in" className="hover:text-white transition-colors">
                    support@farmsconnect.in
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+911234567890" className="hover:text-white transition-colors">
                    +91 123 456 7890
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="max-w-xs">
                    123 Farm Road, Green Valley<br />
                    Kerala, India - 678901
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className="text-lg font-semibold mb-4 text-green-300">Stay Updated</h3>
            <p className="text-green-200 text-sm mb-3">
              Subscribe to get latest farm updates and offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-green-700 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors font-medium text-sm whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-green-700 flex flex-col md:flex-row justify-between items-center text-sm text-green-300"
        >
          <div className="flex items-center space-x-1 mb-4 md:mb-0">
            <Copyright className="w-4 h-4" />
            <span>{currentYear} farmsconnect.in. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}