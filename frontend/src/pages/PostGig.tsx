import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addGig } from '@/store/slices/gigsSlice';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/toast';
import { toast } from 'sonner';

const PostGig = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground">
            Sign In Required
          </h1>
          <p className="mb-6 text-muted-foreground">
            You need to be logged in to post a gig.
          </p>
          <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !budget) {
      showToast(false, 'Please fill in all fields');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast(false, 'Please enter a valid budget');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newGig = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      budget: budgetNum,
      status: 'open' as const,
      clientId: user!.id,
      clientName: user!.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addGig(newGig));
    showToast(true, 'Gig posted successfully!');
    navigate(`/gigs/${newGig.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Post a New Gig</CardTitle>
              <CardDescription>
                Describe your project and set a budget to attract the right talent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Gig Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a Modern E-commerce Website"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the project in detail. What skills are required? What are the deliverables?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/2000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter your budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="pl-9"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Post Gig
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default PostGig;
