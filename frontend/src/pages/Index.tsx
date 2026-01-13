import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { ArrowRight, Briefcase, Users, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
const Index = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const features = [
    {
      icon: Briefcase,
      title: 'Post & Discover Gigs',
      description: 'Create job listings or browse opportunities in seconds.',
    },
    {
      icon: Users,
      title: 'Connect with Talent',
      description: 'Find skilled freelancers or reach clients worldwide.',
    },
    {
      icon: Zap,
      title: 'Fast Hiring Process',
      description: 'Review bids and hire the perfect match instantly.',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Your payments and data are always protected.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Gigs' },
    { value: '50K+', label: 'Freelancers' },
    { value: '98%', label: 'Satisfaction' },
    { value: '$5M+', label: 'Paid Out' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              The Future of Freelancing is Here
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Find Work. Hire Talent.{' '}
              <span className="text-gradient">Get Things Done.</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              GigFlow connects skilled freelancers with clients who need their expertise.
              Post a gig or start bidding — your next opportunity is just a click away.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button size="lg" asChild className="gradient-primary hover:opacity-90 transition-opacity h-12 px-8">
                    <Link to="/post-gig">
                      Post a Gig
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-12 px-8">
                    <Link to="/gigs">Browse Gigs</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild className="gradient-primary hover:opacity-90 transition-opacity h-12 px-8">
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-12 px-8">
                    <Link to="/gigs">Explore Gigs</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -top-20 right-1/4 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you're hiring or looking for work, GigFlow makes it simple.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mx-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 card-hover"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border bg-secondary/30 py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              How GigFlow Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 mx-10">
            {[
              {
                step: '01',
                title: 'Post or Browse',
                description: 'Create a gig listing or browse available opportunities.',
              },
              {
                step: '02',
                title: 'Connect & Bid',
                description: 'Submit proposals or review incoming bids from freelancers.',
              },
              {
                step: '03',
                title: 'Hire & Deliver',
                description: 'Choose your perfect match and get the job done.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-display font-bold text-primary/10 mb-4">
                  {item.step}
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 mx-10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center md:p-16"
          >
            <div className="absolute  inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to Start Your Journey?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/80">
                Join thousands of freelancers and clients already using GigFlow.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="h-12 px-8 bg-background text-foreground hover:bg-background/90"
              >
                <Link to={isAuthenticated ? '/gigs' : '/signup'}>
                  {isAuthenticated ? 'Browse Gigs' : 'Create Free Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="flex items-center justify-center">
     
            <p className="text-sm text-muted-foreground">
              © 2024 GigFlow. All rights reserved.
            </p>
          
        </div>
      </footer>
    </div>
  );
};

export default Index;
