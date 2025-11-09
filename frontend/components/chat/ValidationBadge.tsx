'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface ValidationBadgeProps {
  status: 'valid' | 'invalid' | 'pending';
  label?: string;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({ status, label }) => {
  const config = {
    valid: {
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700 border-green-300',
      iconColor: 'text-green-600'
    },
    invalid: {
      icon: AlertCircle,
      color: 'bg-red-100 text-red-700 border-red-300',
      iconColor: 'text-red-600'
    },
    pending: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      iconColor: 'text-yellow-600'
    }
  };

  const { icon: Icon, color, iconColor } = config[status];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      <Icon className={`w-3 h-3 ${iconColor}`} />
      {label && <span>{label}</span>}
    </motion.div>
  );
};