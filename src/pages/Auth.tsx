
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
        
        if (profile && profile.subscription_status === 'active') {
          navigate("/");
        } else {
          toast({
            title: "Subscription Required",
            description: "Please subscribe to access the application.",
            variant: "destructive"
          });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">Sign in to continue to Promptopia</p>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full py-6 flex items-center justify-center gap-2 text-lg"
          onClick={handleGoogleLogin}
        >
          <FcGoogle className="w-6 h-6" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default Auth;
