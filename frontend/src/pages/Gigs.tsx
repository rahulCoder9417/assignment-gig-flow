import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Header from '@/components/Header';
import GigCard from '@/components/GigCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { onSubmitAxios } from '@/lib/axios';
import { showToast } from '@/lib/toast';

interface Gig {
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

const Gigs = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch gigs
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const response = await onSubmitAxios('get', 'gigs/?status=open', {}, {}, );
         console.log(response.data.data);
        setGigs(response.data.data);
        setFilteredGigs(response.data.data);
      } catch (error: any) {
        console.error('Error fetching gigs:', error);
        showToast(false, 'Failed to load gigs');
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  // Handle search with backend API
  useEffect(() => {
    const searchGigs = async () => {
      if (!searchQuery.trim()) {
        // No search query - show all open gigs
        setFilteredGigs(gigs);
        return;
      }

      try {
        const response= await onSubmitAxios('get', 'gigs/search', {}, {}, { search: searchQuery });
        setFilteredGigs(response.data.data);
      } catch (error: any) {
        console.error('Error searching gigs:', error);
        showToast(false, 'Failed to search gigs');
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      searchGigs();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, gigs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading gigs...</p>
        </div>
      </div>
    );
  }

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
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mx-10">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Browse Gigs</h1>
              <p className="mt-1 text-muted-foreground">
                {filteredGigs.length} open {filteredGigs.length === 1 ? 'opportunity' : 'opportunities'}
              </p>
            </div>
            {isAuthenticated && (
              <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
                <Link to="/post-gig">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Post a Gig
                </Link>
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-8 max-w-md mx-10">
            <SearchBar
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              placeholder="Search gigs by title or description..."
            />
          </div>

          {/* Gigs Grid */}
          {filteredGigs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mx-10">
              {filteredGigs.map((gig, index) => (
                <GigCard key={gig._id} gig={gig as {bidCount: number, ownerName: string, ownerAvatar: string} & Gig} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                {searchQuery ? 'No gigs found' : 'No open gigs'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Be the first to post a gig!'}
              </p>
              {isAuthenticated && !searchQuery && (
                <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
                  <Link to="/post-gig">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Post a Gig
                  </Link>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Gigs;