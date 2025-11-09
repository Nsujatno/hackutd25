'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TicketField } from '@/types/chat.types';

interface TicketFieldChipProps {
  field: TicketField;
}

export const TicketFieldChip: React.FC<TicketFieldChipProps> = ({ field }) => {
  const statusColors = {
    valid: 'bg-blue-100 text-blue-800 border-blue-300',
    invalid: 'bg-red-100 text-red-800 border-red-300',
    pending: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[field.status]} mr-2 mb-2`}
    >
      <span className="font-semibold">{field.name}:</span>
      <span>{field.value}</span>
    </motion.span>
  );
};
