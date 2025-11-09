'use client';
import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { BoardColumn } from '../../components/BoardColumn';
import { Ticket, TicketStatus } from '../../components/TicketCard';

type UserRole = 'admin' | 'engineer';

// Sample data
const sampleTickets: Ticket[] = [
  {
    id: '1',
    title: 'Install H100 GPU in Pod 7',
    priority: 'P0',
    status: 'ready',
    deviceType: 'H100',
    location: 'Pod 7, Rack 42U',
    estimatedDuration: 45,
    createdAt: new Date(Date.now() - 3600000),
    description: 'Install new H100 GPU unit with thermal paste application',
    inventory: ['H100 GPU', 'Thermal Paste', 'Mounting Screws']
  },
  {
    id: '2',
    title: 'Replace faulty PDU',
    priority: 'P1',
    status: 'ready',
    deviceType: 'PDU',
    location: 'Pod 7, Rack 38U',
    estimatedDuration: 30,
    createdAt: new Date(Date.now() - 7200000),
    description: 'PDU showing voltage fluctuations',
    inventory: ['PDU Unit', 'Power Cables']
  },
  {
    id: '3',
    title: 'Network switch maintenance',
    priority: 'P2',
    status: 'in-progress',
    deviceType: 'Switch',
    location: 'Pod 5, Rack 12U',
    estimatedDuration: 60,
    createdAt: new Date(Date.now() - 10800000),
    description: 'Firmware update and cable inspection'
  },
  {
    id: '4',
    title: 'Server diagnostic check',
    priority: 'P3',
    status: 'ready',
    deviceType: 'Server',
    location: 'Pod 3, Rack 22U',
    estimatedDuration: 20,
    createdAt: new Date(Date.now() - 14400000),
    description: 'Routine health check'
  },
  {
    id: '5',
    title: 'Cable replacement Pod 2',
    priority: 'P0',
    status: 'ready',
    deviceType: 'Cable',
    location: 'Pod 2, Rack 15U',
    estimatedDuration: 15,
    createdAt: new Date(Date.now() - 1800000),
    description: 'Damaged fiber optic cable needs replacement'
  }
];

export default function KanbanBoard() {
  const [userRole] = useState<UserRole>('admin');
  const [tickets, setTickets] = useState<Ticket[]>(sampleTickets);
  const [isDragging, setIsDragging] = useState(false);
  
  const columns: { title: string; status: TicketStatus }[] = userRole === 'admin' 
    ? [
        { title: 'Ready', status: 'ready' },
        { title: 'In Progress', status: 'in-progress' },
        { title: 'Complete', status: 'complete' }
      ]
    : [
        { title: 'Ready', status: 'ready' },
        { title: 'In Progress', status: 'in-progress' },
        { title: 'Complete', status: 'complete' }
      ];

  const handleDrop = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
    setIsDragging(false);
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      console.log(`Ticket "${ticket.title}" moved to ${newStatus}`);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 min-w-max">
            {columns.map(col => (
              <BoardColumn
                key={col.status}
                title={col.title}
                status={col.status}
                tickets={tickets.filter(t => t.status === col.status)}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}