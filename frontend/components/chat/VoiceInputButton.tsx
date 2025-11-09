'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface VoiceInputButtonProps {
  onActivate: () => void;
  isActive?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ 
  onActivate, 
  isActive = false 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onActivate}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      aria-label="Voice input"
    >
      <Mic className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
    </motion.button>
  );
};
