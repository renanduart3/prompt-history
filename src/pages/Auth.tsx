
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
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

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
          <h1 className="text-3xl font-bold mb-2">Welcome to Promptopia</h1>
          <p className="text-muted-foreground">Generate perfect image prompts from your text</p>
        </div>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 flex items-center justify-center gap-2 text-lg"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="w-6 h-6" />
            Sign in with Google
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Start with our free tier (500 words) and upgrade anytime for full access to 6,250 words!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
