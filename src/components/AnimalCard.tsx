import { motion } from "framer-motion";
import Link from "next/link";

interface AnimalCardProps {
  title: string;
  price: number;
  details: string;
  image?: string;
  link?: string;
  onClick ?: any
  isClickable ?: boolean 
}

export function AnimalCard({ title, price, details, image, link , onClick,isClickable }: AnimalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300"
    >
      <Link href={link || "#"} className="block">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {image && (
            <div className="relative w-full h-40">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
            <p className="text-lg font-bold text-green-600 mt-1">₹{price}</p>
            <p className="text-sm text-gray-600 mt-1">{details}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}