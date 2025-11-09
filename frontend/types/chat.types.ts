export interface TicketField {
  name: string;
  value: string;
  status: 'valid' | 'invalid' | 'pending';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  fields?: TicketField[];
  timestamp: Date;
}