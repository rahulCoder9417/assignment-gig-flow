import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  DollarSign,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Timer,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { onSubmitAxios } from '@/lib/axios';

interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  status: 'open' | 'assigned';
  createdAt: string;
}

interface Bid {
  _id: string;
  gigId: Gig;
  freelancerId: string;
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
}

const MyBids = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyBids = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await onSubmitAxios('get', 'bids/my');
     
        setMyBids(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching bids:', err);
        setError(err.response?.data?.message || 'Failed to fetch bids');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, [isAuthenticated]);

  const pendingBids = useMemo(() => myBids.filter((b) => b.status === 'pending'), [myBids]);
  const hiredBids = useMemo(() => myBids.filter((b) => b.status === 'hired'), [myBids]);
  const rejectedBids = useMemo(() => myBids.filter((b) => b.status === 'rejected'), [myBids]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground">
            Sign In Required
          </h1>
          <p className="mb-6 text-muted-foreground">
            You need to be logged in to view your bids.
          </p>
          <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      class: 'status-pending',
      icon: Timer,
      label: 'Pending',
    },
    hired: {
      class: 'status-hired',
      icon: CheckCircle,
      label: 'Hired',
    },
    rejected: {
      class: 'status-rejected',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const BidRow = ({ bid, index }: { bid: Bid; index: number }) => {
    const gig = bid.gigId;
    const status = statusConfig[bid.status];
    const StatusIcon = status.icon;
    const navigate = useNavigate();
    if (!gig) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="gradient-card border border-border overflow-hidden card-hover">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {gig.title}
                  </Link>
                  <div onClick={() => navigate(`/profile/${gig.ownerId?._id}`)} className="flex items-center gap-2">
                  <img src={gig.ownerId?.avatarUrl} alt="" className='w-10 h-10 rounded-full' />
                  <p className="mt-1 text-sm text-muted-foreground">
                   {gig.ownerId?.name || 'Unknown'}
                  </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={status.class}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/gigs/${gig._id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  "{bid.message}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="font-semibold text-foreground">
                    ${bid.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    (Budget: ${gig.budget.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Submitted{' '}
                    {formatDistanceToNow(new Date(bid.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8 mx-10">
            <h1 className="font-display text-3xl font-bold text-foreground">My Bids</h1>
            <p className="mt-1 text-muted-foreground">
              Track the status of your proposals
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
              <p className="text-muted-foreground">Loading your bids...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                Error loading bids
              </h3>
              <p className="mb-6 text-muted-foreground">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="gradient-primary hover:opacity-90 transition-opacity"
              >
                Try Again
              </Button>
            </div>
          ) : myBids.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                No bids yet
              </h3>
              <p className="mb-6 text-muted-foreground">
                Start by browsing gigs and submitting proposals!
              </p>
              <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
                <Link to="/gigs">Browse Gigs</Link>
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="pending" className="space-y-6 mx-10">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  Pending
                  {pendingBids.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {pendingBids.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="hired" className="gap-2">
                  Hired
                  {hiredBids.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-success/20 text-success">
                      {hiredBids.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  Rejected
                  {rejectedBids.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {rejectedBids.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingBids.length > 0 ? (
                  pendingBids.map((bid, index) => (
                    <BidRow key={bid._id} bid={bid} index={index} />
                  ))
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No pending bids</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="hired" className="space-y-4">
                {hiredBids.length > 0 ? (
                  hiredBids.map((bid, index) => (
                    <BidRow key={bid._id} bid={bid} index={index} />
                  ))
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No hired bids yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejectedBids.length > 0 ? (
                  rejectedBids.map((bid, index) => (
                    <BidRow key={bid._id} bid={bid} index={index} />
                  ))
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No rejected bids</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {myBids.map((bid, index) => (
                  <BidRow key={bid._id} bid={bid} index={index} />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MyBids;