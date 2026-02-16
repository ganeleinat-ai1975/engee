import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ImageLightbox({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        style={{ cursor: 'zoom-out' }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
          className="relative max-w-full max-h-full"
        >
          <img
            src={imageUrl.replace(/width=\d+/, 'width=1600').replace(/quality=\d+/, 'quality=90')} // Request higher quality image
            alt="Enlarged product view"
            className="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 transition-all shadow-lg"
            aria-label="Close image view"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}