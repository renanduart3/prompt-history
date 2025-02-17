
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PREMIUM_WORD_LIMIT = 6250;
const FREE_WORD_LIMIT = 500; // Added free tier limit

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

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getPricingMessage = () => {
    if (!profile?.country) return null;
    
    const pricingByRegion: Record<string, string> = {
      US: "$9.99/month",
      GB: "£7.99/month",
      EU: "€8.99/month",
    };

    return pricingByRegion[profile.country] || "$9.99/month";
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to subscribe",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('stripe', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive"
      });
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
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
          ? `Please keep your text under ${currentWordLimit} words. Current count: ${wordCount}`
          : `Free users are limited to ${FREE_WORD_LIMIT} words. Upgrade to Premium for ${PREMIUM_WORD_LIMIT} words.`,
        variant: "destructive"
      });
      return;
    }

    if (!isPremium && wordCount > FREE_WORD_LIMIT) {
      toast({
        title: "Premium Feature",
        description: `Please subscribe to process more than ${FREE_WORD_LIMIT} words. ${getPricingMessage()}`,
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
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Transform Text into Visual Prompts
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate perfect image prompts from your video scripts and transcriptions
            in seconds.
          </p>
          {!isPremium && (
            <div className="mt-4">
              <p className="text-muted-foreground mb-2">
                Free tier: Up to {FREE_WORD_LIMIT} words
              </p>
              <Button
                variant="default"
                size="lg"
                className="mt-2"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : `Upgrade to Premium (${PREMIUM_WORD_LIMIT} words)`}
              </Button>
            </div>
          )}
        </div>

        {/* Main Card */}
        <Card className="max-w-4xl mx-auto p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Script or Transcription
              </label>
              <Textarea
                placeholder={`Paste your text here (max ${currentWordLimit} words)...`}
                className="min-h-[200px] input-field"
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
                className="button-primary"
                disabled={!text || isGenerating}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {isGenerating ? "Generating..." : "Generate Prompts"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: "Script to Prompts",
              description: "Convert your video scripts into detailed image prompts automatically",
            },
            {
              title: "Smart Segmentation",
              description: "Automatically break down your content into perfect prompt-sized chunks",
            },
            {
              title: "Professional Results",
              description: "Get high-quality prompts optimized for AI image generation",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-center card-hover animate-fade-in"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
