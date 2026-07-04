import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-[12rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-blue-500 to-purple-600 opacity-20">
          404
        </h1>
        <div className="-mt-20 relative z-10">
          <h2 className="text-4xl font-bold mb-4">Lost in Space?</h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            The page you're looking for has drifted away or never existed in this dimension.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-white text-[#0f172a] px-8 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Reality
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
