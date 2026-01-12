import { Provider } from 'react-redux';
import { store } from './store/store';
import { Toaster  } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Gigs from "./pages/Gigs";
import GigDetail from "./pages/GigDetail";
import PostGig from "./pages/PostGig";
import MyGigs from "./pages/MyGigs";
import MyBids from "./pages/MyBids";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster
        richColors
        closeButton
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "rounded-xl shadow-lg border",
            title: "text-base font-semibold",
            description: "text-sm opacity-90",
          },
        }}
      />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/gigs/:id" element={<GigDetail />} />
            <Route path="/post-gig" element={<PostGig />} />
            <Route path="/my-gigs" element={<MyGigs />} />
            <Route path="/my-bids" element={<MyBids />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
