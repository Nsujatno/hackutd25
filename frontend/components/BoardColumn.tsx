import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketCard, Ticket, TicketStatus } from './TicketCard';

interface BoardColumnProps {
  title: string;
  status: TicketStatus;
  tickets: Ticket[];
  onDrop: (ticketId: string, newStatus: TicketStatus) => void;
  onDragStart: () => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ 
  title, 
  status, 
  tickets,
  onDrop,
  onDragStart
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('ticketId', ticketId);
    setDraggingId(ticketId);
    onDragStart();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      onDrop(ticketId, status);
    }
    setIsDragOver(false);
    setDraggingId(null);
  };

  return (
    <div className="flex-1 min-w-[280px]">
      <div 
        className={`bg-gray-100 rounded-lg p-4 transition-all ${isDragOver ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700 uppercase text-sm">{title}</h2>
          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
            {tickets.length}
          </span>
        </div>
        
        <div className="space-y-3 min-h-[200px]">
          <AnimatePresence>
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                draggable
                onDragStart={(e) => handleDragStart(e, ticket.id)}
                onDragEnd={() => setDraggingId(null)}
              >
                <TicketCard 
                  ticket={ticket} 
                  onExpand={() => {}} 
                  isDragging={draggingId === ticket.id}
                />
              </div>
            ))}
          </AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center text-purple-600 font-medium bg-purple-50"
            >
              Drop ticket here
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

