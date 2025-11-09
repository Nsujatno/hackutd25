'use client';
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Header } from '../../components/Header';
import { BoardColumn } from '../../components/BoardColumn';
import { Ticket, TicketStatus } from '../../components/TicketCard';

type UserRole = 'admin' | 'engineer';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/tickets';

interface NewTicketForm {
  device: string;
  pod: string;
  rack?: string;
  switch?: string;
  ports?: string[];
  required_parts?: string[];
  action?: string;
  description?: string;
  assign_to_email?: string;
}

export default function KanbanBoard() {
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [userRole, setUserRole] = useState<UserRole>('engineer');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For the add ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicketForm>({
    device: '',
    pod: '',
    rack: '',
    switch: '',
    ports: [],
    required_parts: [],
    action: 'INSTALL',
    description: '',
    assign_to_email: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const columns: { title: string; status: TicketStatus }[] = [
    { title: 'Ready', status: 'ready' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Complete', status: 'complete' }
  ];

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      fetchUserRole();
    }
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (isLoaded && isSignedIn && userRole) {
      fetchTickets();
    }
  }, [userRole, isLoaded, isSignedIn]);

  const fetchUserRole = async () => {
    try {
      const token = await getToken();

      const response = await fetch(`http://localhost:8000/users/get_role`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role === 'ticket_creator' || data.role === 'admin' ? 'admin' : 'engineer');
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
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }

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
        technicalRequirements: ticket.technical_requirements
          ? JSON.parse(ticket.technical_requirements)
          : [],
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: backendStatus })
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
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
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

  const handleNewTicketChange = (field: keyof NewTicketForm, value: any) => {
    setNewTicket((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTicket = async () => {
    setCreateError(null);
    setCreating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setCreateError(errorData.detail || 'Failed to create ticket');
      } else {
        await fetchTickets();
        setShowCreateModal(false);
        setNewTicket({
          device: '',
          pod: '',
          rack: '',
          switch: '',
          ports: [],
          required_parts: [],
          action: 'INSTALL',
          description: '',
          assign_to_email: ''
        });
      }
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const CreateTicketModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-bold mb-4">Create New Ticket</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Device"
            className="w-full border rounded px-3 py-2"
            value={newTicket.device}
            onChange={(e) => handleNewTicketChange('device', e.target.value)}
          />
          <input
            type="text"
            placeholder="Pod"
            className="w-full border rounded px-3 py-2"
            value={newTicket.pod}
            onChange={(e) => handleNewTicketChange('pod', e.target.value)}
          />
          <input
            type="text"
            placeholder="Rack (optional)"
            className="w-full border rounded px-3 py-2"
            value={newTicket.rack}
            onChange={(e) => handleNewTicketChange('rack', e.target.value)}
          />
          <input
            type="text"
            placeholder="Switch (optional)"
            className="w-full border rounded px-3 py-2"
            value={newTicket.switch}
            onChange={(e) => handleNewTicketChange('switch', e.target.value)}
          />
          <input
            type="text"
            placeholder="Ports (comma separated)"
            className="w-full border rounded px-3 py-2"
            value={newTicket.ports?.join(',')}
            onChange={(e) =>
              handleNewTicketChange(
                'ports',
                e.target.value.split(',').map((p) => p.trim())
              )
            }
          />
          <input
            type="text"
            placeholder="Required Parts (comma separated)"
            className="w-full border rounded px-3 py-2"
            value={newTicket.required_parts?.join(',')}
            onChange={(e) =>
              handleNewTicketChange(
                'required_parts',
                e.target.value.split(',').map((p) => p.trim())
              )
            }
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={newTicket.action}
            onChange={(e) => handleNewTicketChange('action', e.target.value)}
          >
            <option value="INSTALL">INSTALL</option>
            <option value="TROUBLESHOOT">TROUBLESHOOT</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="REPLACE">REPLACE</option>
            <option value="UPGRADE">UPGRADE</option>
          </select>
          <textarea
            placeholder="Description"
            className="w-full border rounded px-3 py-2"
            value={newTicket.description}
            onChange={(e) => handleNewTicketChange('description', e.target.value)}
          />
          <input
            type="email"
            placeholder="Assign to email (optional)"
            className="w-full border rounded px-3 py-2"
            value={newTicket.assign_to_email}
            onChange={(e) => handleNewTicketChange('assign_to_email', e.target.value)}
          />

          {createError && <p className="text-red-600">{createError}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleCreateTicket}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
            <p className="text-gray-600 text-lg mb-4">
              Please sign in to view tickets
            </p>
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
              onClick={() => setShowCreateModal(true)}
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

      {showCreateModal && <CreateTicketModal />}
    </div>
  );
}
