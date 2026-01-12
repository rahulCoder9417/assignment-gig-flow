import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setGigStatus } from '@/store/slices/gigsSlice';
import { addBid, hireBid } from '@/store/slices/bidsSlice';
import Header from '@/components/Header';
import BidCard from '@/components/BidCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Clock,
  User,
  ArrowLeft,
  Send,
  CheckCircle,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';

const GigDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { gigs } = useAppSelector((state) => state.gigs);
  const { bids } = useAppSelector((state) => state.bids);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [bidMessage, setBidMessage] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gig = useMemo(() => gigs.find((g) => g.id === id), [gigs, id]);
  const gigBids = useMemo(() => bids.filter((b) => b.gigId === id), [bids, id]);
  
  const isOwner = user?.id === gig?.clientId;
  const hasAlreadyBid = gigBids.some((b) => b.freelancerId === user?.id);

  if (!gig) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground">
            Gig Not Found
          </h1>
          <p className="mb-6 text-muted-foreground">
            This gig may have been removed or doesn't exist.
          </p>
          <Button variant="outline" onClick={() => navigate('/gigs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    open: 'status-open',
    assigned: 'status-assigned',
    completed: 'bg-muted text-muted-foreground',
  };

  const handleSubmitBid = async () => {
    if (!bidMessage.trim() || !bidPrice) {
      showToast(false, 'Please fill in all fields');
      return;
    }

    const price = parseFloat(bidPrice);
    if (isNaN(price) || price <= 0) {
      showToast(false, 'Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    dispatch(
      addBid({
        id: crypto.randomUUID(),
        gigId: gig.id,
        freelancerId: user!.id,
        freelancerName: user!.name,
        freelancerEmail: user!.email,
        message: bidMessage.trim(),
        price,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
    );

    showToast(true, 'Bid submitted successfully!');
    setBidDialogOpen(false);
    setBidMessage('');
    setBidPrice('');
    setIsSubmitting(false);
  };

  const handleHire = (bidId: string) => {
    const bid = gigBids.find((b) => b.id === bidId);
    if (!bid) return;

    // Update bid statuses
    dispatch(hireBid({ bidId, gigId: gig.id }));
    
    // Update gig status
    dispatch(
      setGigStatus({
        id: gig.id,
        status: 'assigned',
        freelancerId: bid.freelancerId,
      })
    );

    showToast(true, `${bid.freelancerName} has been hired!`);
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
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gig Details */}
              <Card className="border-border overflow-hidden">
                <CardHeader className="border-b border-border bg-secondary/30">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="font-display text-2xl">
                        {gig.title}
                      </CardTitle>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          <span>{gig.clientName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>
                            Posted{' '}
                            {formatDistanceToNow(new Date(gig.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusColors[gig.status]}>
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="mb-3 font-semibold text-foreground">Description</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {gig.description}
                  </p>
                </CardContent>
              </Card>

              {/* Bids Section */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-display text-xl">
                      <Users className="h-5 w-5 text-primary" />
                      Bids ({gigBids.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {gigBids.length > 0 ? (
                    <div className="space-y-4">
                      {gigBids.map((bid, index) => (
                        <BidCard
                          key={bid.id}
                          bid={bid}
                          isOwner={isOwner && gig.status === 'open'}
                          onHire={handleHire}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No bids yet</p>
                      {gig.status === 'open' && !isOwner && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Be the first to submit a proposal!
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget Card */}
              <Card className="border-border sticky top-24">
                <CardContent className="pt-6">
                  <div className="mb-6 text-center">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <DollarSign className="h-6 w-6 text-success" />
                      <span className="font-display text-4xl font-bold text-foreground">
                        {gig.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    isOwner ? (
                      <div className="space-y-3">
                        <p className="text-center text-sm text-muted-foreground">
                          This is your gig
                        </p>
                        {gig.status === 'open' && gigBids.length > 0 && (
                          <p className="text-center text-sm text-primary">
                            Review bids and hire a freelancer
                          </p>
                        )}
                      </div>
                    ) : gig.status !== 'open' ? (
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-6 w-6 text-primary" />
                        <p className="text-sm font-medium text-foreground">
                          This gig has been assigned
                        </p>
                      </div>
                    ) : hasAlreadyBid ? (
                      <div className="rounded-lg bg-success/10 p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-6 w-6 text-success" />
                        <p className="text-sm font-medium text-success">
                          You've submitted a bid
                        </p>
                      </div>
                    ) : (
                      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gradient-primary hover:opacity-90 transition-opacity">
                            <Send className="mr-2 h-4 w-4" />
                            Submit a Bid
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-display">Submit Your Bid</DialogTitle>
                            <DialogDescription>
                              Propose your rate and explain why you're the best fit.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="bid-price">Your Price ($)</Label>
                              <Input
                                id="bid-price"
                                type="number"
                                placeholder="Enter your price"
                                value={bidPrice}
                                onChange={(e) => setBidPrice(e.target.value)}
                                min="1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bid-message">Cover Letter</Label>
                              <Textarea
                                id="bid-message"
                                placeholder="Explain your experience and how you'll approach this project..."
                                value={bidMessage}
                                onChange={(e) => setBidMessage(e.target.value)}
                                rows={5}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setBidDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitBid}
                              disabled={isSubmitting}
                              className="gradient-primary hover:opacity-90 transition-opacity"
                            >
                              {isSubmitting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Submit Bid
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Button asChild className="w-full gradient-primary hover:opacity-90 transition-opacity">
                        <Link to="/login">Sign in to Bid</Link>
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GigDetail;
