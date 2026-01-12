import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Bid } from '@/types';

interface BidsState {
  bids: Bid[];
  isLoading: boolean;
}

// Sample bids for demo
const sampleBids: Bid[] = [
  {
    id: 'bid-1',
    gigId: '1',
    freelancerId: 'freelancer-1',
    freelancerName: 'Alex Rivera',
    freelancerEmail: 'alex@example.com',
    message: 'I have 5+ years of experience building e-commerce platforms with React and Next.js. I can deliver a fully functional site within 3 weeks.',
    price: 2200,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bid-2',
    gigId: '1',
    freelancerId: 'freelancer-2',
    freelancerName: 'Jordan Lee',
    freelancerEmail: 'jordan@example.com',
    message: 'Expert in Shopify and custom React solutions. I have completed 50+ e-commerce projects. Happy to discuss your requirements in detail.',
    price: 2400,
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const initialState: BidsState = {
  bids: sampleBids,
  isLoading: false,
};

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    addBid: (state, action: PayloadAction<Bid>) => {
      state.bids.unshift(action.payload);
    },
    updateBid: (state, action: PayloadAction<{ id: string; updates: Partial<Bid> }>) => {
      const index = state.bids.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bids[index] = { ...state.bids[index], ...action.payload.updates };
      }
    },
    setBidStatus: (state, action: PayloadAction<{ id: string; status: Bid['status'] }>) => {
      const bid = state.bids.find(b => b.id === action.payload.id);
      if (bid) {
        bid.status = action.payload.status;
      }
    },
    rejectAllBidsForGig: (state, action: PayloadAction<{ gigId: string; exceptBidId: string }>) => {
      state.bids = state.bids.map(bid => {
        if (bid.gigId === action.payload.gigId && bid.id !== action.payload.exceptBidId) {
          return { ...bid, status: 'rejected' };
        }
        return bid;
      });
    },
    hireBid: (state, action: PayloadAction<{ bidId: string; gigId: string }>) => {
      // Mark the chosen bid as hired
      const chosenBid = state.bids.find(b => b.id === action.payload.bidId);
      if (chosenBid) {
        chosenBid.status = 'hired';
      }
      // Reject all other bids for this gig
      state.bids = state.bids.map(bid => {
        if (bid.gigId === action.payload.gigId && bid.id !== action.payload.bidId) {
          return { ...bid, status: 'rejected' };
        }
        return bid;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { addBid, updateBid, setBidStatus, rejectAllBidsForGig, hireBid, setLoading } = bidsSlice.actions;
export default bidsSlice.reducer;
