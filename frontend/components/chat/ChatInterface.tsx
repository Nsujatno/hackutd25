'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Message, TicketField } from '@/types/chat.types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { VoiceInputButton } from './VoiceInputButton';
import { SidebarSummary } from './SidebarSummary';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hi! I\'m here to help you create a ticket. You can describe what you need, and I\'ll extract the relevant details. For example, try: "Create a ticket for H100 install in Pod 7, high priority, estimated 2 hours."',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extractedFields, setExtractedFields] = useState<TicketField[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Mock AI response logic with field extraction
  const generateAIResponse = (userMessage: string): { content: string; fields: TicketField[] } => {
    const responses = [
      {
        keywords: ['h100', 'install', 'pod'],
        content: 'Got it! I see you need an H100 installation in Pod 7. What priority level should this be? (low, medium, high, critical)',
        fields: [
          { name: 'Device Type', value: 'H100', status: 'valid' as const },
          { name: 'Location', value: 'Pod 7', status: 'valid' as const },
          { name: 'Task Type', value: 'Installation', status: 'valid' as const },
          { name: 'Priority', value: 'Not set', status: 'pending' as const }
        ]
      },
      {
        keywords: ['high', 'priority'],
        content: 'Perfect! High priority noted. How much time do you estimate this will take?',
        fields: [
          { name: 'Priority', value: 'High', status: 'valid' as const }
        ]
      },
      {
        keywords: ['hour', 'hrs', 'h'],
        content: 'Great! I\'ve captured the estimated time. Would you like to add any additional notes or assign this to someone?',
        fields: [
          { name: 'Estimated Time', value: '2 hours', status: 'valid' as const }
        ]
      }
    ];

    const lowerMessage = userMessage.toLowerCase();
    
    for (const response of responses) {
      if (response.keywords.some(kw => lowerMessage.includes(kw))) {
        return response;
      }
    }

    return {
      content: 'I understand. Could you provide more details about the device type, location, and priority?',
      fields: []
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = generateAIResponse(inputValue);
    
    // Update extracted fields
    if (aiResponse.fields.length > 0) {
      setExtractedFields(prev => {
        const newFields = [...prev];
        aiResponse.fields.forEach(newField => {
          const existingIndex = newFields.findIndex(f => f.name === newField.name);
          if (existingIndex >= 0) {
            newFields[existingIndex] = newField;
          } else {
            newFields.push(newField);
          }
        });
        return newFields;
      });
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      content: aiResponse.content,
      fields: aiResponse.fields.length > 0 ? aiResponse.fields : undefined,
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    console.log('Voice input toggled:', !isVoiceActive);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <TypingIndicator />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
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
                  placeholder="Describe your ticket... (e.g., 'Install H100 GPU in Pod 7, high priority')"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <VoiceInputButton 
                onActivate={handleVoiceToggle}
                isActive={isVoiceActive}
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="mt-2 text-xs text-gray-400 text-center">
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Summary */}
      <SidebarSummary 
        fields={extractedFields}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};
