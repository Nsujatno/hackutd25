import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ChevronDown, ChevronUp, FileText, AlertTriangle, Lightbulb, BookOpen, Mail } from 'lucide-react';
import { DeviceIcon, DeviceType } from './DeviceIcon';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type TicketStatus = 'ready' | 'in_progress' | 'complete';

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
  assignedToEmail?: string; // Added field for assigned email
  inventory?: string[];
  technicalRequirements?: string[];
  warnings?: string[];
  suggestions?: string[];
  priorityJustification?: string;
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

// Helper function to parse and format technical requirements
const formatTechnicalRequirement = (req: string) => {
  const withoutCitations = req.replace(/\[\d+\]/g, '');
  const sentences = withoutCitations
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);
  return sentences;
};

// Helper function to extract citations
const extractCitations = (req: string) => {
  const citations = req.match(/\[\d+\]/g);
  return citations ? citations.join(' ') : null;
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onExpand, isDragging }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
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
      className={`w-110 bg-white rounded-2xl shadow-lg border-t-4 ${priorityBorders[ticket.priority]} px-6 py-4 cursor-grab active:cursor-grabbing hover:shadow-xl transition-shadow ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`${priorityColors[ticket.priority]} text-white text-xs font-bold px-7 py-2 rounded-xl`}
          >
            {ticket.priority}
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <DeviceIcon type={ticket.deviceType} />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-2">{ticket.title}</h3>

      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
        <MapPin className="w-5 h-5" />
        <span>{ticket.location}</span>
      </div>

      {/* New section displaying assigned email */}
      {ticket.assignedToEmail && (
        <div className="flex items-center gap-1 text-sm text-gray-700 mb-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>Assigned to: {ticket.assignedToEmail}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 py-2">
          <Clock className="w-5 h-5" />
          <span>{ticket.estimatedDuration} min</span>
        </div>
        <span>{timeAgo(ticket.createdAt)}</span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 space-y-4"
          >
            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
            </div>

            {/* Priority Justification */}
            {ticket.priorityJustification && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Priority Reason
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">{ticket.priorityJustification}</p>
              </div>
            )}

            {/* Warnings */}
            {ticket.warnings && ticket.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings
                </h4>
                <ul className="space-y-1">
                  {ticket.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {ticket.suggestions && ticket.suggestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {ticket.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Requirements */}
            {ticket.technicalRequirements && ticket.technicalRequirements.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Technical Requirements & Procedures
                </h4>
                <div className="space-y-3">
                  {ticket.technicalRequirements.map((req, idx) => {
                    const sentences = formatTechnicalRequirement(req);
                    const citations = extractCitations(req);

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-3 border border-purple-100 shadow-sm"
                      >
                        <div className="space-y-2">
                          {sentences.map((sentence, sIdx) => (
                            <p key={sIdx} className="text-sm text-purple-900 leading-relaxed">
                              {sentence.trim()}
                            </p>
                          ))}
                        </div>

                        {/* Citations */}
                        {citations && (
                          <div className="mt-2 pt-2 border-t border-purple-100">
                            <span className="text-xs text-purple-600 font-medium">
                              Sources: {citations}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary count */}
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-purple-700 font-medium">
                    📚 {ticket.technicalRequirements.length} technical procedure
                    {ticket.technicalRequirements.length !== 1 ? 's' : ''} from
                    documentation
                  </p>
                </div>
              </div>
            )}

            {/* Required Inventory */}
            {ticket.inventory && ticket.inventory.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Required Inventory</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.inventory.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-md font-medium"
                    >
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
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 mx-auto text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 mx-auto text-gray-400" />
        )}
      </div>
    </motion.div>
  );
};
