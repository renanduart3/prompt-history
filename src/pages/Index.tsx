
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PREMIUM_WORD_LIMIT = 6250;
const FREE_WORD_LIMIT = 500;

interface UserProfile {
  subscription_status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  country: string | null;
}

const Index = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isPremium = profile?.subscription_status === 'active';
  const currentWordLimit = isPremium ? PREMIUM_WORD_LIMIT : FREE_WORD_LIMIT;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('subscription_status, country')
          .eq('id', session.user.id)
          .single();
        
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to subscribe",
          variant: "destructive"
        });
        return;
      }

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
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Could not initiate subscription process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const wordCount = getWordCount(newText);
    
    if (wordCount > currentWordLimit) {
      toast({
        title: "Word limit exceeded",
        description: isPremium 
          ? `Please keep your text under ${currentWordLimit} words`
          : `Free users are limited to ${FREE_WORD_LIMIT} words. Upgrade to Premium for ${PREMIUM_WORD_LIMIT} words.`,
        variant: "destructive"
      });
      return;
    }
    
    setText(newText);
  };

  const handleGenerate = async () => {
    const wordCount = getWordCount(text);
    
    if (wordCount > currentWordLimit) {
      toast({
        title: "Word limit exceeded",
        description: isPremium 
          ? `Please keep your text under ${currentWordLimit} words`
          : `Free users are limited to ${FREE_WORD_LIMIT} words. Upgrade to Premium for ${PREMIUM_WORD_LIMIT} words.`,
        variant: "destructive"
      });
      return;
    }

    if (!isPremium && wordCount > FREE_WORD_LIMIT) {
      toast({
        title: "Premium Feature",
        description: `Please subscribe to process more than ${FREE_WORD_LIMIT} words.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    // TODO: Implement generation logic
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Transform Text into Visual Prompts
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Generate perfect image prompts from your video scripts and transcriptions in seconds.
          </p>
          {!isPremium && (
            <div className="mb-8">
              <div className="text-lg mb-4">
                <span className="font-semibold">Free Tier:</span> Up to {FREE_WORD_LIMIT} words
              </div>
              <Button
                variant="default"
                size="lg"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="animate-pulse"
              >
                {isLoading ? "Loading..." : `Upgrade to Premium (${PREMIUM_WORD_LIMIT} words)`}
              </Button>
            </div>
          )}
        </div>

        <Card className="max-w-4xl mx-auto p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Script or Transcription
              </label>
              <Textarea
                placeholder={`Paste your text here (max ${currentWordLimit} words)...`}
                className="min-h-[200px]"
                value={text}
                onChange={handleTextChange}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Word count: {getWordCount(text)} / {currentWordLimit}
                {!isPremium && (
                  <span className="ml-2 text-primary">
                    (Free tier: {FREE_WORD_LIMIT} words)
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                className="w-full sm:w-auto"
                disabled={!text || isGenerating}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {isGenerating ? "Generating..." : "Generate Prompts"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
