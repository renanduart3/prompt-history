
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.subscription_status === 'active') {
          navigate("/");
        } else {
          try {
            const response = await fetch(
              `${window.location.origin}/functions/v1/stripe`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to fetch from Stripe function');
            }

            const data = await response.json();
            
            if (data?.url) {
              window.location.href = data.url;
            } else {
              throw new Error('No checkout URL received');
            }
          } catch (error) {
            console.error('Stripe function error:', error);
            toast({
              title: "Error",
              description: "Could not initiate subscription process. Please try again.",
              variant: "destructive"
            });
          }
        }
      }
    };
    checkUser();
  }, [navigate, toast]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBypassAuth = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123',
    });

    if (error) {
      toast({
        title: "Bypass Failed",
        description: "Could not sign in with test account. Make sure it exists in Supabase.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">Sign in to continue to Promptopia</p>
        </div>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 flex items-center justify-center gap-2 text-lg"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="w-6 h-6" />
            Continue with Google
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleBypassAuth}
            >
              Bypass Auth (Dev Only)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
