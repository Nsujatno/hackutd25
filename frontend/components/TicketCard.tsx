import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { DeviceIcon, DeviceType } from './DeviceIcon';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type TicketStatus = 'ready' | 'in-progress' | 'complete';

export interface Ticket {
  id: string;
  title: string;
  priority: Priority;
  status: TicketStatus;
  deviceType: DeviceType;
  location: string;
  estimatedDuration: number;
  createdAt: Date;
  description: string;
  inventory?: string[];
}

const priorityColors: Record<Priority, string> = {
  P0: 'bg-red-500',
  P1: 'bg-orange-500',
  P2: 'bg-yellow-500',
  P3: 'bg-blue-500',
  P4: 'bg-gray-500'
};

const priorityBorders: Record<Priority, string> = {
  P0: 'border-red-500',
  P1: 'border-orange-500',
  P2: 'border-yellow-500',
  P3: 'border-blue-500',
  P4: 'border-gray-500'
};

interface TicketCardProps {
  ticket: Ticket;
  onExpand: () => void;
  isDragging?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onExpand, 
  isDragging 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time on mount and every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);
  
  const timeAgo = (date: Date) => {
    const minutes = Math.floor((currentTime - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-sm border-l-4 ${priorityBorders[ticket.priority]} p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'opacity-50 rotate-2' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <div className={`${priorityColors[ticket.priority]} text-white text-xs font-bold px-2 py-1 rounded`}>
            {ticket.priority}
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <DeviceIcon type={ticket.deviceType} />
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{ticket.title}</h3>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <MapPin className="w-4 h-4" />
        <span>{ticket.location}</span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{ticket.estimatedDuration}min</span>
        </div>
        <span>{timeAgo(ticket.createdAt)}</span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>
            {ticket.inventory && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Required Inventory:</h4>
                <div className="flex flex-wrap gap-1">
                  {ticket.inventory.map((item, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-2 text-center">
        {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto text-gray-400" /> : <ChevronDown className="w-4 h-4 mx-auto text-gray-400" />}
      </div>
    </motion.div>
  );
};
