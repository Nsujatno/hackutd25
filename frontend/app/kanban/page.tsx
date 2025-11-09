'use client';
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
// import { Header } from '../../components/Header';
import { BoardColumn } from '../../components/BoardColumn';
import { Ticket, TicketStatus } from '../../components/TicketCard';

type UserRole = 'ticket_creator' | 'technician';

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
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);

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
        // Store the actual role from backend: 'ticket_creator' or 'technician'
        setUserRole(data.role as UserRole);
        console.log('User role fetched:', data.role);
      } else {
        // Default to technician if fetch fails
        setUserRole('technician');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole('technician');
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      // ticket_creator sees all tickets, technician sees only assigned tickets
      const endpoint = userRole === 'ticket_creator' ? `${API_BASE_URL}/list` : `${API_BASE_URL}/my-tickets`;

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
        assignedToEmail: ticket.assigned_to_email || ticket.assigned_to || '',
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

  const generateWorkBlock = async () => {
    setIsGeneratingWorkflow(true);
    
    try {
      // Get all tickets in 'ready' status
      const readyTickets = tickets.filter(t => t.status === 'ready');
      
      if (readyTickets.length === 0) {
        alert('No tickets in Ready status to organize');
        setIsGeneratingWorkflow(false);
        return;
      }
      
      // Priority order mapping (P0 is most critical, P4 is least critical)
      const getPriorityValue = (priority: string): number => {
        const match = priority.match(/P(\d+)/i);
        if (match) {
          return parseInt(match[1], 10);
        }
        // Fallback for non-standard priority formats
        return 999;
      };
      
      // Extract pod number from location string
      const extractPodNumber = (location: string): number => {
        const match = location.match(/pod\s*(\d+)/i);
        return match ? parseInt(match[1], 10) : 999;
      };
      
      // Extract rack number from location string
      const extractRackNumber = (location: string): number => {
        const match = location.match(/rack\s*(\d+)/i);
        return match ? parseInt(match[1], 10) : 999;
      };
      
      // Sort by priority first (P0 -> P4), then by pod number, then by rack
      const sortedTickets = [...readyTickets].sort((a, b) => {
        // Compare priority first
        const priorityA = getPriorityValue(a.priority);
        const priorityB = getPriorityValue(b.priority);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If same priority, sort by pod number
        const podA = extractPodNumber(a.location);
        const podB = extractPodNumber(b.location);
        
        if (podA !== podB) {
          return podA - podB;
        }
        
        // If same pod, sort by rack number
        const rackA = extractRackNumber(a.location);
        const rackB = extractRackNumber(b.location);
        
        return rackA - rackB;
      });
      
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Optimized work order:', sortedTickets.map(t => ({
        title: t.title,
        priority: t.priority,
        location: t.location,
        priorityValue: getPriorityValue(t.priority),
        podNumber: extractPodNumber(t.location),
        rackNumber: extractRackNumber(t.location)
      })));
      
      // Update the tickets state with the sorted order
      // Keep tickets from other statuses in their original positions
      setTickets(prevTickets => {
        const inProgressTickets = prevTickets.filter(t => t.status === 'in_progress');
        const completeTickets = prevTickets.filter(t => t.status === 'complete');
        return [...sortedTickets, ...inProgressTickets, ...completeTickets];
      });
      
      alert(`Workflow optimized! ${sortedTickets.length} tickets organized by priority (P0→P4) and location.`);
      
    } catch (error) {
      console.error('Error generating work block:', error);
      alert('Failed to generate work block. Please try again.');
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  if (userRoleLoading || userRole === null) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* <Header /> */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* <Header /> */}
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
        {/* <Header /> */}
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
        {/* <Header /> */}
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
        {/* <Header /> */}
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Header /> */}
      
      {/* Loading overlay for workflow generation */}
      {isGeneratingWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Generating Optimized Workflow...</p>
            <p className="text-gray-500 text-sm mt-2">Sorting by priority and location</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Action buttons */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 z-10 shrink-0">
          {/* Technicians can generate workflow */}
          {userRole === 'technician' && (
            <button
              onClick={generateWorkBlock}
              disabled={isGeneratingWorkflow}
              className={`px-4 py-2 rounded transition ${
                isGeneratingWorkflow
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title="Generate optimized work block"
            >
              {isGeneratingWorkflow ? 'Generating...' : 'Generate Work Block'}
            </button>
          )}
          
          {/* Ticket creators can create tickets */}
          {userRole === 'ticket_creator' && (
            <button
              onClick={() => router.push('/create-ticket')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              + Create Ticket
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          <div className="p-6">
            <div className="flex gap-4">
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