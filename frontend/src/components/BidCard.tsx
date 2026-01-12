import type { Bid } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface BidCardProps {
  bid: Bid;
  isOwner?: boolean;
  onHire?: (bidId: string) => void;
  showGigLink?: boolean;
  index?: number;
}

const BidCard = ({ bid, isOwner = false, onHire, showGigLink = false, index = 0 }: BidCardProps) => {
  const statusConfig = {
    pending: { class: 'status-pending', icon: Clock, label: 'Pending' },
    hired: { class: 'status-hired', icon: CheckCircle, label: 'Hired' },
    rejected: { class: 'status-rejected', icon: XCircle, label: 'Rejected' },
  };

  const status = statusConfig[bid.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="gradient-card border border-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {bid.freelancerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{bid.freelancerName}</p>
                <p className="text-sm text-muted-foreground">{bid.freelancerEmail}</p>
              </div>
            </div>
            <Badge variant="secondary" className={status.class}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{bid.message}</p>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="font-semibold text-foreground">${bid.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            
            {isOwner && bid.status === 'pending' && onHire && (
              <Button
                size="sm"
                onClick={() => onHire(bid.id)}
                className="gradient-primary hover:opacity-90 transition-opacity"
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Hire
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BidCard;
