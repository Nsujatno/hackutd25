import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
        <div className="flex items-center gap-3">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Work Block
          </button>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Group by Priority</option>
            <option>Group by Location</option>
            <option>Group by Type</option>
          </select>
        </div>
      </div>
    </header>
  );
};