'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TicketField } from '@/types/chat.types';
import { ValidationBadge } from './ValidationBadge';

interface SidebarSummaryProps {
  fields: TicketField[];
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarSummary: React.FC<SidebarSummaryProps> = ({ 
  fields, 
  isOpen, 
  onClose 
}) => {
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.status]) acc[field.status] = [];
    acc[field.status].push(field);
    return acc;
  }, {} as Record<string, TicketField[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ticket Summary</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {['valid', 'pending', 'invalid'].map(status => {
              const statusFields = groupedFields[status] || [];
              if (statusFields.length === 0) return null;

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <ValidationBadge status={status as any} />
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {status} ({statusFields.length})
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {statusFields.map((field, idx) => (
                      <motion.div
                        key={`${status}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          {field.name}
                        </div>
                        <div className="text-sm text-gray-900">{field.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No fields captured yet. Start the conversation to create your ticket.
              </div>
            )}
          </div>

          {fields.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Ticket
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
