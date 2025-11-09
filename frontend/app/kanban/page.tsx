'use client';
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { BoardColumn } from '../../components/BoardColumn';
import { Ticket, TicketStatus } from '../../components/TicketCard';

type UserRole = 'admin' | 'engineer';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/tickets';

export default function KanbanBoard() {
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userRoleLoading, setUserRoleLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns: { title: string; status: TicketStatus }[] = [
    { title: 'Ready', status: 'ready' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Complete', status: 'complete' },
  ];

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      setUserRoleLoading(true);
      fetchUserRole().finally(() => setUserRoleLoading(false));
    }
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (!userRoleLoading && userRole !== null && isLoaded && isSignedIn) {
      fetchTickets();
    }
  }, [userRole, userRoleLoading, isLoaded, isSignedIn]);

  const fetchUserRole = async () => {
    try {
      const token = await getToken();

      const response = await fetch(`http://localhost:8000/users/get_role`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role === 'ticket_creator' || data.role === 'admin' ? 'admin' : 'engineer');
      } else {
        setUserRole('engineer');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole('engineer');
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const endpoint = userRole === 'admin' ? `${API_BASE_URL}/list` : `${API_BASE_URL}/my-tickets`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch tickets: ${response.statusText}`);

      const data = await response.json();
      const transformedTickets: Ticket[] = data.tickets.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        deviceType: ticket.device,
        location: `${ticket.pod}, Rack ${ticket.rack || 'N/A'}`,
        estimatedDuration: ticket.estimated_duration_minutes || 30,
        createdAt: new Date(ticket.created_at),
        description: ticket.description || '',
        inventory: ticket.required_parts ? JSON.parse(ticket.required_parts) : [],
        technicalRequirements: ticket.technical_requirements ? JSON.parse(ticket.technical_requirements) : [],
        warnings: ticket.warnings ? JSON.parse(ticket.warnings) : [],
        suggestions: ticket.suggestions ? JSON.parse(ticket.suggestions) : [],
        priorityJustification: ticket.priority_justification || '',
        assignedToEmail: ticket.assigned_to_email || ticket.assigned_to || '', // map assigned email or fallback
      }));

      setTickets(transformedTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const backendStatus = newStatus.replace('-', '_');

      const response = await fetch(`${API_BASE_URL}/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to update ticket status');
      }

      const data = await response.json();
      console.log('Ticket updated successfully:', data);

      return true;
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to update ticket status');
      return false;
    }
  };

  const handleDrop = async (ticketId: string, newStatus: TicketStatus) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket))
    );
    setIsDragging(false);

    const success = await updateTicketStatus(ticketId, newStatus);

    if (!success) {
      fetchTickets();
    } else {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        console.log(`Ticket "${ticket.title}" moved to ${newStatus}`);
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  if (userRoleLoading || userRole === null) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Please sign in to view tickets</p>
            <a
              href="/sign-in"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <button
              onClick={fetchTickets}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col">
        {/* Add Ticket button - visible only for admin/ticket_creator */}
        {userRole === 'admin' && (
          <div className="p-6 border-b border-gray-200 flex justify-end sticky top-0 bg-gray-50 z-10">
            <button
              onClick={() => router.push('/create-ticket')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              + Create Ticket
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-4 min-w-max">
              {columns.map((col) => (
                <BoardColumn
                  key={col.status}
                  title={col.title}
                  status={col.status}
                  tickets={tickets.filter((t) => t.status === col.status)}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}