
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/components/ui/use-toast";
import { Wand2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Wand2 className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Promptopia
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Transform Your Text into Visual Prompts
          </p>
          <p className="text-sm text-muted-foreground">
            Start with our free tier (500 words) and upgrade anytime for full access!
          </p>
        </div>
        
        <div className="space-y-4 animate-fade-in [--animate-delay:200ms]">
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
