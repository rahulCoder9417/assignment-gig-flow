import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Briefcase,
  Plus,
  DollarSign,
  Clock,
  Users,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';
import { onSubmitAxios } from '@/lib/axios';

interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: string;
  status: 'open' | 'assigned' | 'completed';
  createdAt: string;
}

interface Bid {
  _id: string;
  gigId: string;
  freelancerId: string;
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
}

interface GigWithBids extends Gig {
  bids: Bid[];
}

const MyGigs = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [myGigs, setMyGigs] = useState<GigWithBids[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's gigs
  useEffect(() => {
    const fetchMyGigs = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user's gigs
        const gigsResponse = await onSubmitAxios('get', 'gigs/my');
        const gigs = gigsResponse.data.data;
        const gigsWithBids = await Promise.all(
          gigs.map(async (gig: Gig) => {
            try {
              const bidsResponse = await onSubmitAxios('get', `bids/getBidByGigId/${gig._id}`);
              return {
                ...gig,
                bids: bidsResponse.data.data,
              };
            } catch (error) {
              console.error(`Error fetching bids for gig ${gig._id}:`, error);
              return {
                ...gig,
                bids: [],
              };
            }
          })
        );

        setMyGigs(gigsWithBids);
      } catch (error: any) {
        console.error('Error fetching gigs:', error);
        showToast(false, 'Failed to load your gigs');
      } finally {
        setLoading(false);
      }
    };

    fetchMyGigs();
  }, [isAuthenticated]);

  const openGigs = myGigs.filter((g) => g.status === 'open');
  const assignedGigs = myGigs.filter((g) => g.status === 'assigned');

  const getBidCountForGig = (gigId: string) => {
    const gig = myGigs.find((g) => g._id === gigId);
    return gig?.bids.length || 0;
  };

  const getPendingBidCount = (gigId: string) => {
    const gig = myGigs.find((g) => g._id === gigId);
    return gig?.bids.filter((b) => b.status === 'pending').length || 0;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading your gigs...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (gigId: string) => {
    try {
      await onSubmitAxios('delete', `gigs/${gigId}`);
      
      // Remove the deleted gig from state
      setMyGigs(myGigs.filter((g) => g._id !== gigId));
      
      showToast(true, 'Gig deleted successfully');
    } catch (error: any) {
      console.error('Error deleting gig:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to delete gig';
      showToast(false, errorMessage);
    }
  };

  const statusColors = {
    open: 'status-open',
    assigned: 'status-assigned',
    completed: 'bg-muted text-muted-foreground',
  };

  const GigRow = ({ gig, index }: { gig: GigWithBids; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="gradient-card border border-border overflow-hidden card-hover mx-10">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div>
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {gig.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-success" />
                      <span>${gig.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(gig.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {getBidCountForGig(gig._id)} bid
                        {getBidCountForGig(gig._id) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={statusColors[gig.status]}>
                {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
              </Badge>
              {gig.status === 'open' && getPendingBidCount(gig._id) > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  {getPendingBidCount(gig._id)} pending
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" >
                  <Link to={`/gigs/${gig._id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                {gig.status === 'open' && (
                  <AlertDialog >
                    <AlertDialogTrigger >
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white"> 
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this gig? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(gig._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background max-w-screen">
      <Header />

      <main className="container py-8 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8 flex mx-10  flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Gigs</h1>
              <p className="mt-1 text-muted-foreground">
                Manage the gigs you've posted
              </p>
            </div>
            <Button  className="gradient-primary hover:opacity-90 transition-opacity">
              <Link to="/post-gig">
                <Plus className="mr-1.5 h-4 w-4" />
                Post a Gig
              </Link>
            </Button>
          </div>

          {myGigs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                No gigs yet
              </h3>
              <p className="mb-6 text-muted-foreground">
                Start by posting your first gig!
              </p>
              <Button  className="gradient-primary hover:opacity-90 transition-opacity">
                <Link to="/post-gig">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Post a Gig
                </Link>
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="open" className="space-y-6 mx-10">
              <TabsList>
                <TabsTrigger value="open" className="gap-2">
                  Open
                  {openGigs.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {openGigs.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="assigned" className="gap-2">
                  Assigned
                  {assignedGigs.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {assignedGigs.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="space-y-4">
                {openGigs.length > 0 ? (
                  openGigs.map((gig, index) => (
                    <GigRow key={gig._id} gig={gig} index={index} />
                  ))
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No open gigs</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="assigned" className="space-y-4">
                {assignedGigs.length > 0 ? (
                  assignedGigs.map((gig, index) => (
                    <GigRow key={gig._id} gig={gig} index={index} />
                  ))
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No assigned gigs</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {myGigs.map((gig, index) => (
                  <GigRow key={gig._id} gig={gig} index={index} />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MyGigs;