export interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    avatarUrl?: string;
    coverImage?: string;
    createdAt: string;
  }
  
  export interface Gig {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: 'open' | 'assigned' | 'completed';
    clientId: string;
    clientName: string;
    assignedFreelancerId?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Bid {
    id: string;
    gigId: string;
    freelancerId: string;
    freelancerName: string;
    freelancerEmail: string;
    message: string;
    price: number;
    status: 'pending' | 'hired' | 'rejected';
    createdAt: string;
  }
  
  export type GigStatus = Gig['status'];
  export type BidStatus = Bid['status'];
  