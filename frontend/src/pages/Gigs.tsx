import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSearchQuery } from '@/store/slices/gigsSlice';
import Header from '@/components/Header';
import GigCard from '@/components/GigCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Gigs = () => {
  const { gigs, searchQuery } = useAppSelector((state) => state.gigs);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const filteredGigs = useMemo(() => {
    if (!searchQuery.trim()) return gigs.filter(g => g.status === 'open');
    
    const query = searchQuery.toLowerCase();
    return gigs.filter(
      (gig) =>
        gig.status === 'open' &&
        (gig.title.toLowerCase().includes(query) ||
          gig.description.toLowerCase().includes(query))
    );
  }, [gigs, searchQuery]);

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
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mb-8 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(value) => dispatch(setSearchQuery(value))}
              placeholder="Search gigs by title or description..."
            />
          </div>

          {/* Gigs Grid */}
          {filteredGigs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGigs.map((gig, index) => (
                <GigCard key={gig.id} gig={gig} index={index} />
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
