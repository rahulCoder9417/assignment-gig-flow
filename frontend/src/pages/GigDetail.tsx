import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Header from '@/components/Header';
import BidCard from '@/components/BidCard'; // Ensure this is created
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
  Pencil,
  Save,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';
import { onSubmitAxios } from '@/lib/axios';
import type { Bid, Gig } from '@/types';

const GigDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [gig, setGig] = useState<Gig & { ownerId: { name: string, avatarUrl: string } } | null>(null);
  const [gigBids, setGigBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Bid State
  const [bidMessage, setBidMessage] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    budget: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch gig details and bids
  useEffect(() => {
    const fetchGigData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch gig details
        const gigResponse = await onSubmitAxios('get', `gigs/getById/${id}`);
        const gigData = gigResponse.data.data;
        setGig(gigData);
        setEditForm({
          title: gigData.title,
          description: gigData.description,
          budget: gigData.budget.toString()
        });

          try {
            // Matches route: router.get("/:gigId", verifyJWT, getBidsForGig);
            const bidsResponse = await onSubmitAxios('get', `bids/getBidByGigId/${id}`);
            setGigBids(bidsResponse.data.data);
          } catch (error: any) {
            console.error('Error fetching bids:', error);
            if (error?.response?.status !== 403) {
              showToast(false, 'Failed to load bids');
            }
          }
        
      } catch (error: any) {
        console.error('Error fetching gig:', error);
        showToast(false, 'Failed to load gig details');
      } finally {
        setLoading(false);
      }
    };

    fetchGigData();
  }, [id, isAuthenticated, user?._id]);

  const isOwner = user?._id === gig?.ownerId._id;
  const hasAlreadyBid = gigBids.some((b) => b.freelancerId?._id === user?._id);

  // --- Edit Logic (Owner Only) ---
  const handleEditToggle = () => {
    if (gig) {
      setEditForm({
        title: gig.title,
        description: gig.description,
        budget: gig.budget.toString()
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveGig = async () => {
    if (!gig) return;

    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.budget) {
      showToast(false, 'Please fill in all fields');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: editForm.title,
        description: editForm.description,
        budget: parseFloat(editForm.budget)
      };

      const response = await onSubmitAxios('patch', `gigs/${gig._id}`, payload);

      let newData = {
        title: response.data.data.title,
        description: response.data.data.description,
        budget: response.data.data.budget
      }
      setGig((prev)=>({...prev,...newData}as Gig&{ownerId:{name:string,avatarUrl:string}}));
      setIsEditing(false);
      showToast(true, 'Gig updated successfully');
    } catch (error: any) {
      console.error('Error updating gig:', error);
      showToast(false, error?.response?.data?.message || 'Failed to update gig');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Submit Bid Logic (Freelancer) ---
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

    if (!gig) return;

    try {
      setIsSubmitting(true);

      await onSubmitAxios('post', 'bids/', {
        gigId: gig._id,
        message: bidMessage.trim(),
        price,
      });

      showToast(true, 'Bid submitted successfully!');
      setBidDialogOpen(false);
      setBidMessage('');
      setBidPrice('');
      
      navigate(0); 
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to submit bid';
      showToast(false, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Hire Logic (Owner) ---
  const handleHire = async (bidId: string) => {
    if (!gig) return;
    
    // Optional: Add a confirm dialog here
    if(!window.confirm("Are you sure you want to hire this freelancer? This will close the gig.")) return;

    try {
     const r=  await onSubmitAxios('patch', `bids/${bidId}/hire`);
      if(r.status !== 200){
        showToast(false, 'Failed to hire freelancer',r.data.message);
        return
      }
      
     const gigResponse = await onSubmitAxios('get', `gigs/getById/${gig._id}`);
      setGig(gigResponse.data.data);

      const bidsResponse = await onSubmitAxios('get', `bids/getBidByGigId/${gig._id}`);
      setGigBids(bidsResponse.data.data);
      
      setIsEditing(false); 
    } catch (error: any) {
      console.error('Error hiring freelancer:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to hire freelancer';
      showToast(false, errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading gig details...</p>
        </div>
      </div>
    );
  }
  
  if (!gig) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground">Gig Not Found</h1>
          <Button variant="outline" onClick={() => navigate('/gigs')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gigs
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary hover:bg-primary/20',
    assigned: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20',
    completed: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
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
          {/* Header Actions */}
          <div className="flex mx-10 justify-between items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {isOwner && gig.status === 'open' && (
              <div className="flex gap-2 mx-10">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={isSaving}>
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveGig} disabled={isSaving}>
                      {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEditToggle}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Gig
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-3 mx-10">
            {/* Left Column: Details & Bids */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Gig Details Card */}
              <Card className="border-border overflow-hidden">
                <CardHeader className="border-b border-border bg-secondary/30">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 w-full">
                      {isEditing ? (
                        <div className="space-y-2 mb-2">
                          <Label htmlFor="edit-title">Gig Title</Label>
                          <Input 
                            id="edit-title"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="text-lg font-semibold"
                          />
                        </div>
                      ) : (
                        <CardTitle className="font-display text-2xl">{gig.title}</CardTitle>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <img src={gig.ownerId.avatarUrl} alt="avatar" className="h-8 w-8" /> <span>{gig.ownerId.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" /> 
                          <span>Posted {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isEditing && (
                      <Badge variant="secondary" className={statusColors[gig.status] || ''}>
                        {gig.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="mb-3 font-semibold text-foreground">Description</h3>
                  {isEditing ? (
                     <Textarea 
                       value={editForm.description}
                       onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                       rows={8}
                       className="resize-y"
                     />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{gig.description}</p>
                  )}
                </CardContent>
              </Card>

                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 font-display text-xl">
                        <Users className="h-5 w-5 text-primary" />
                        Bids Received ({gigBids.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {gigBids.length > 0 ? (
                      <div className="space-y-4">
                        {gigBids.map((bid, index) => (
                          <BidCard
                            key={bid._id}
                            bid={bid}
                            isOwner={isOwner} // Pass true, handled inside component logic
                            onHire={handleHire}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed rounded-lg">
                        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No bids received yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </div>

            {/* Right Column: Budget & Action */}
            <div className="space-y-6">
              <Card className="border-border sticky top-24">
                <CardContent className="pt-6">
                  <div className="mb-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Budget</p>
                    {isEditing ? (
                       <div className="flex items-center justify-center gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="number"
                            value={editForm.budget}
                            onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                            className="max-w-[120px] text-center"
                          />
                       </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <DollarSign className="h-6 w-6 text-success" />
                        <span className="font-display text-4xl font-bold text-foreground">
                          {gig.budget.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {isAuthenticated ? (
                    isOwner ? (
                      <div className="rounded-lg bg-secondary/50 p-4 text-center">
                        <p className="text-sm font-medium text-foreground">You own this gig</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {gig.status === 'open' 
                            ? "Wait for freelancers to bid, then select 'Hire' on their proposal." 
                            : "This gig is currently assigned/closed."}
                        </p>
                      </div>
                    ) : gig.status !== 'open' ? (
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-6 w-6 text-primary" />
                        <p className="text-sm font-medium text-foreground">Gig assigned</p>
                        <p className="text-xs text-muted-foreground">Applications are closed.</p>
                      </div>
                    ) : hasAlreadyBid ? (
                      <div className="rounded-lg bg-success/10 p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-6 w-6 text-success" />
                        <p className="text-sm font-medium text-success">Bid Submitted</p>
                        <p className="text-xs text-muted-foreground mt-1">Wait for the owner to review.</p>
                      </div>
                    ) : (
                      <Dialog open={bidDialogOpen}   onOpenChange={setBidDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gradient-primary  hover:opacity-90 transition-opacity">
                            <Send className="mr-2 h-4 w-4" /> Submit a Bid
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>Submit Your Bid</DialogTitle>
                            <DialogDescription>
                              Propose your rate and tell the client why you are the best fit.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="bid-price">Your Price ($)</Label>
                              <Input
                                id="bid-price"
                                type="number"
                                placeholder="e.g. 500"
                                value={bidPrice}
                                onChange={(e) => setBidPrice(e.target.value)}
                                min="1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bid-message">Cover Letter</Label>
                              <Textarea
                                id="bid-message"
                                placeholder="I have 5 years experience with..."
                                value={bidMessage}
                                onChange={(e) => setBidMessage(e.target.value)}
                                rows={5}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>Cancel</Button>
                            <Button  onClick={handleSubmitBid} disabled={isSubmitting} className="gradient-primary">
                              {isSubmitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <>Submit Bid</>}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Button asChild className="w-full gradient-primary">
                        <Link to="/login">Sign in to Bid</Link>
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        No account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
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