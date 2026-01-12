import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Gig } from '@/types';

interface GigsState {
  gigs: Gig[];
  isLoading: boolean;
  searchQuery: string;
}

// Sample gigs for demo
const sampleGigs: Gig[] = [
  {
    id: '1',
    title: 'Build a Modern E-commerce Website',
    description: 'Looking for an experienced React developer to build a full-featured e-commerce platform with payment integration, user authentication, and admin dashboard.',
    budget: 2500,
    status: 'open',
    clientId: 'demo-user-1',
    clientName: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Mobile App UI/UX Design',
    description: 'Need a talented designer to create a beautiful and intuitive mobile app design for a fitness tracking application. Must include wireframes and high-fidelity mockups.',
    budget: 1500,
    status: 'open',
    clientId: 'demo-user-2',
    clientName: 'Michael Chen',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'WordPress Blog Customization',
    description: 'Seeking a WordPress expert to customize an existing theme, optimize performance, and set up SEO best practices for a travel blog.',
    budget: 800,
    status: 'open',
    clientId: 'demo-user-3',
    clientName: 'Emma Williams',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'API Development with Node.js',
    description: 'Building a RESTful API for a SaaS application. Must have experience with Node.js, Express, PostgreSQL, and implementing secure authentication.',
    budget: 3000,
    status: 'open',
    clientId: 'demo-user-4',
    clientName: 'David Park',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

const initialState: GigsState = {
  gigs: sampleGigs,
  isLoading: false,
  searchQuery: '',
};

const gigsSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    addGig: (state, action: PayloadAction<Gig>) => {
      state.gigs.unshift(action.payload);
    },
    updateGig: (state, action: PayloadAction<{ id: string; updates: Partial<Gig> }>) => {
      const index = state.gigs.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.gigs[index] = { ...state.gigs[index], ...action.payload.updates };
      }
    },
    deleteGig: (state, action: PayloadAction<string>) => {
      state.gigs = state.gigs.filter(g => g.id !== action.payload);
    },
    setGigStatus: (state, action: PayloadAction<{ id: string; status: Gig['status']; freelancerId?: string }>) => {
      const gig = state.gigs.find(g => g.id === action.payload.id);
      if (gig) {
        gig.status = action.payload.status;
        if (action.payload.freelancerId) {
          gig.assignedFreelancerId = action.payload.freelancerId;
        }
        gig.updatedAt = new Date().toISOString();
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { addGig, updateGig, deleteGig, setGigStatus, setSearchQuery, setLoading } = gigsSlice.actions;
export default gigsSlice.reducer;
