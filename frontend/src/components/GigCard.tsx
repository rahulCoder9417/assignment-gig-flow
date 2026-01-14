import { Link } from 'react-router-dom';
import type { Gig } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface GigCardProps {
  gig: {bidCount: number, ownerName: string, ownerAvatar: string} & Gig;
  
  index?: number;
}

const GigCard = ({ gig, index = 0 }: GigCardProps) => {
  console.log(gig)
  const statusColors = {
    open: 'status-open',
    assigned: 'status-assigned',
    completed: 'bg-muted text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group card-hover gradient-card overflow-hidden border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link
                to={`/gigs/${gig._id}`}
                className="block font-display text-lg font-semibold leading-tight text-foreground transition-colors hover:text-primary line-clamp-2"
              >
                {gig.title}
              </Link>
            </div>
            <Badge variant="secondary" className={statusColors[gig.status]}>
              {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {gig.description}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="font-semibold text-foreground">${gig.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}</span>
            </div>
            
          </div>
          
          <span className='text-blue-800'>{gig.bidCount}</span>{" "}Bids   
          <div className="flex items-center  gap-1.5 text-sm text-muted-foreground">
           <img src={gig.ownerAvatar} className="h-8 w-8 rounded-full" />
           <span>{gig.ownerName}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GigCard;
