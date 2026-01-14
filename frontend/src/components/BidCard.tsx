import { formatDistanceToNow } from 'date-fns';
import { User, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Bid } from '@/types'; // Ensure you have this type defined
import { useNavigate } from 'react-router-dom';
interface BidCardProps {
  bid: Bid;
  isOwner: boolean;
  onHire: (bidId: string) => void;
  index: number;
}

const BidCard = ({ bid, isOwner, onHire, index }: BidCardProps) => {
  const isHired = bid.status === 'hired';
  const navigate = useNavigate();
  return (
    <Card onClick={()=>navigate(`/profile/${bid.freelancerId?._id}`)} className={`overflow-hidden transition-all duration-300 hover:shadow-md ${isHired ? 'border-success/50 bg-success/5' : 'border-border'}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Freelancer Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <img src={bid.freelancerId?.avatarUrl} alt="" className="rounded-full w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">
                  {bid.freelancerId?.name || 'Unknown Freelancer'}
                </h4>
                {isHired && (
                  <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/20">
                    Hired
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <span className="block text-2xl font-bold font-display text-primary">
              ${bid.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">Proposed amount</span>
          </div>
        </div>
<div className="flex justify-between">
        {/* Message */}
        <div className="mt-4 rounded-md bg-muted/50 p-4">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {bid.message}
          </p>
        </div>

        {/* Hire Action - Only show if Owner and Gig is Open (or this bid is the hired one) */}
        {isOwner && (
          <div className="mt-4 flex justify-end">
            {isHired ? (
              <Button disabled variant="outline" className="border-success text-success opacity-100">
                <CheckCircle className="mr-2 h-4 w-4" />
                Hired
              </Button>
            ) : bid.status !== 'rejected' ? (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onHire(bid._id)}}
                className="gradient-primary"
                size="sm"
              >
                Hire Freelancer
              </Button>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Rejected
              </Badge>
            )}
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BidCard;