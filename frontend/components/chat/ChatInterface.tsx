'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  fields?: TicketField[];
  isSuccess?: boolean;
}

interface TicketField {
  name: string;
  value: string;
  status: 'valid' | 'pending' | 'invalid';
}

interface TicketData {
  device?: string;
  pod?: string;
  rack?: string;
  switch?: string;
  ports?: string[];
  required_parts?: string[];
  action?: string;
  description?: string;
  assign_to_email?: string;
}

const API_BASE_URL = 'http://localhost:8000';

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[70%] ${isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-lg px-4 py-3 shadow-sm`}>
        <p className={`text-sm whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
        {message.fields && message.fields.length > 0 && (
          <div className={`mt-3 pt-3 ${isUser ? 'border-blue-400' : 'border-gray-200'} border-t space-y-1`}>
            {message.fields.map((field, idx) => (
              <div key={idx} className="text-xs flex items-center gap-2">
                <span className={`font-semibold ${isUser ? 'text-blue-100' : 'text-gray-800'}`}>{field.name}:</span>
                <span className={`${isUser ? 'text-blue-50' : 'text-gray-700'}`}>{field.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
    <div className="flex gap-1">
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  </div>
);

const SidebarSummary: React.FC<{
  fields: TicketField[];
  isOpen: boolean;
  isComplete: boolean;
  onCreateTicket: () => void;
  isCreating: boolean;
  hasValidationError: boolean;
}> = ({ fields, isOpen, isComplete, onCreateTicket, isCreating, hasValidationError }) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Summary</h3>
      {fields.length === 0 ? (
        <p className="text-sm text-gray-600">No fields extracted yet</p>
      ) : (
        <div className="space-y-3 flex-1">
          {fields.map((field, idx) => (
            <div key={idx} className="pb-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-600 mb-1">{field.name}</div>
              <div className="text-sm text-gray-900 font-medium">{field.value}</div>
            </div>
          ))}
        </div>
      )}

      {isComplete && (
        <>
          {hasValidationError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Please address the validation issues in the chat before creating the ticket.
              </p>
            </div>
          )}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: hasValidationError ? 1 : 1.02 }}
            whileTap={{ scale: hasValidationError ? 1 : 0.98 }}
            onClick={onCreateTicket}
            disabled={isCreating || hasValidationError}
            className={`mt-6 w-full px-4 py-3 font-semibold rounded-lg transition-colors shadow-md ${
              hasValidationError
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {isCreating ? 'Creating...' : hasValidationError ? 'Fix Issues First' : 'Create Ticket'}
          </motion.button>
        </>
      )}
    </div>
  );
};

export const ChatInterface: React.FC = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hi! I\'m here to help you create a ticket. You can describe what you need, and I\'ll extract the relevant details. For example, try: "Fix H100 GPU wiring in Pod 7, rack 42U, switch-7b, ports 49-50"',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extractedFields, setExtractedFields] = useState<TicketField[]>([]);
  const [ticketData, setTicketData] = useState<TicketData>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [ticketCreatedSuccessfully, setTicketCreatedSuccessfully] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasValidationError, setHasValidationError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const convertTicketDataToFields = (data: TicketData): TicketField[] => {
    const fields: TicketField[] = [];

    if (data.device) fields.push({ name: 'Device', value: data.device, status: 'valid' });
    if (data.pod) fields.push({ name: 'Pod', value: data.pod, status: 'valid' });
    if (data.rack) fields.push({ name: 'Rack', value: data.rack, status: 'valid' });
    if (data.switch) fields.push({ name: 'Switch', value: data.switch, status: 'valid' });
    if (data.ports && data.ports.length > 0) fields.push({ name: 'Ports', value: data.ports.join(', '), status: 'valid' });
    if (data.required_parts && data.required_parts.length > 0)
      fields.push({ name: 'Required Parts', value: data.required_parts.join(', '), status: 'valid' });
    if (data.action) fields.push({ name: 'Action', value: data.action, status: 'valid' });
    if (data.description) fields.push({ name: 'Description', value: data.description, status: 'valid' });
    if (data.assign_to_email) fields.push({ name: 'Assigned To', value: data.assign_to_email, status: 'valid' });

    return fields;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    setError(null);
    setHasValidationError(false); // Clear validation error when user sends new message

    try {
      const response = await fetch(`${API_BASE_URL}/llm/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          ticket_data: ticketData,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setTicketData(data.ticket_data);
      setIsComplete(data.is_complete);

      const fields = convertTicketDataToFields(data.ticket_data);
      setExtractedFields(fields);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: data.response,
        fields: fields.length > 0 ? fields : undefined,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setIsTyping(false);
      setError('Failed to communicate with the server. Please make sure the backend is running.');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: "Sorry, I'm having trouble connecting to the server. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTicket = async () => {
    if (!isLoaded || !isSignedIn) {
      setError('You must be signed in to create tickets.');
      return;
    }

    setIsCreating(true);
    setError(null);
    setTicketCreatedSuccessfully(false);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Failed to retrieve authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle validation failures
        if (data.validation && data.validation.is_valid === false) {
          setHasValidationError(true);
          
          const warnings = (data.validation.warnings || []).map((w: string) => `• ${w}`).join('\n');
          const suggestions = (data.validation.suggestions || []).map((s: string) => `• ${s}`).join('\n');
          const techReqs = (data.validation.technical_requirements || []).map((t: string) => `• ${t}`).join('\n');

          const validationParts = [
            '❌ Ticket validation failed. Please address the following issues:\n',
          ];
          
          if (warnings) {
            validationParts.push(`\n⚠️ Warnings:\n${warnings}`);
          }
          
          if (suggestions) {
            validationParts.push(`\n💡 Suggestions:\n${suggestions}`);
          }
          
          if (techReqs) {
            validationParts.push(`\n🔧 Technical Requirements:\n${techReqs}`);
          }
          
          validationParts.push('\n\nPlease update the ticket information in the chat and I will help you fix these issues.');

          const validationMessage = validationParts.join('');
          setError(validationMessage);

          const warningMsg: Message = {
            id: Date.now().toString(),
            sender: 'assistant',
            content: validationMessage,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, warningMsg]);

          return;
        } else {
          throw new Error(data.detail || data.message || `API error: ${response.status}`);
        }
      }

      // Success - clear validation error state
      setHasValidationError(false);
      setError(null);
      setTicketCreatedSuccessfully(true);

      const successMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: `✅ ${data.message}\n\nTicket ID: ${data.ticket_id}\n\nYour ticket has been created successfully!`,
        timestamp: new Date(),
        isSuccess: true,
      };
      setMessages((prev) => [...prev, successMessage]);

      setTicketData({});
      setExtractedFields([]);
      setIsComplete(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create ticket. Please try again.';
      setError(errorMsg);
      console.error('Ticket creation error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoToKanban = () => {
    router.push('/kanban');
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to create tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Ticket</h2>
              <p className="text-sm text-gray-500 mt-1">Describe your ticket and I'll help you fill in the details</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isSidebarOpen ? 'Hide' : 'Show'} Summary
            </button>
          </div>
          {error && (
            <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm whitespace-pre-wrap text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage message={message} />
                {ticketCreatedSuccessfully && message.isSuccess && (
                  <motion.button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
                    onClick={handleGoToKanban}
                  >
                    Go to Kanban
                  </motion.button>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    hasValidationError
                      ? "Update your ticket details to fix validation issues..."
                      : "Describe your ticket... (e.g., 'Fix H100 wiring in Pod 7, rack 42U, switch-7b')"
                  }
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  disabled={isTyping}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="mt-2 text-xs text-gray-500 text-center">
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </div>
      </div>

      <SidebarSummary
        fields={extractedFields}
        isOpen={isSidebarOpen}
        isComplete={isComplete}
        onCreateTicket={handleCreateTicket}
        isCreating={isCreating}
        hasValidationError={hasValidationError}
      />
    </div>
  );
};