export interface User {
    _id: string;
    email: string;
    name: string;
    username: string;
    avatarUrl?: string;
    coverImage?: string;
    createdAt: string;
  }
 export interface Gig {
    _id: string;
    title: string;
    description: string;
    budget: number;
    ownerId: {
      _id: string;
      name: string;
      email: string;
    };
    status: 'open' | 'assigned' | 'completed';
    createdAt: string;
  }
  
 export interface Bid {
    _id: string;
    gigId: string;
    freelancerId: {
      _id: string;
      name: string;
      avatarUrl: string;
    };
    message: string;
    price: number;
    status: 'pending' | 'hired' | 'rejected';
    createdAt: string;
  }
  
  export type GigStatus = Gig['status'];
  export type BidStatus = Bid['status'];
  