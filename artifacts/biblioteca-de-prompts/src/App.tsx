import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { Shell } from '@/components/layout/Shell';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Explore from '@/pages/Explore';
import Favorites from '@/pages/Favorites';
import MyPrompts from '@/pages/MyPrompts';
import NewPrompt from '@/pages/NewPrompt';
import PromptDetail from '@/pages/PromptDetail';
import Generate from '@/pages/Generate';
import Plans from '@/pages/Plans';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/explore" component={Explore} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/my-prompts" component={MyPrompts} />
        <Route path="/my-prompts/new" component={NewPrompt} />
        <Route path="/prompts/:id" component={PromptDetail} />
        <Route path="/generate" component={Generate} />
        <Route path="/plans" component={Plans} />
        <Route path="/profile" component={Profile} />
        
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
