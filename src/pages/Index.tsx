
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const WORD_LIMIT = 6250;

interface UserProfile {
  subscription_status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  country: string | null;
}

const Index = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

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
    
    // Example regional pricing messages
    const pricingByRegion: Record<string, string> = {
      US: "$9.99/month",
      GB: "£7.99/month",
      EU: "€8.99/month",
      // Add more regions as needed
    };

    return pricingByRegion[profile.country] || "$9.99/month";
  };

  const handleGenerate = async () => {
    const wordCount = getWordCount(text);
    
    if (wordCount > WORD_LIMIT) {
      toast({
        title: "Word limit exceeded",
        description: `Please keep your text under ${WORD_LIMIT} words. Current count: ${wordCount}`,
        variant: "destructive"
      });
      return;
    }

    if (profile?.subscription_status !== 'active') {
      toast({
        title: "Subscription Required",
        description: `Please subscribe to use this feature. ${getPricingMessage()}`,
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
          {profile?.subscription_status !== 'active' && (
            <Button
              variant="default"
              size="lg"
              className="mt-6"
              onClick={() => {
                toast({
                  title: "Subscribe Now",
                  description: `Get unlimited access for ${getPricingMessage()}`,
                });
                // TODO: Implement subscription flow
              }}
            >
              Subscribe Now
            </Button>
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
                placeholder={`Paste your text here (max ${WORD_LIMIT} words)...`}
                className="min-h-[200px] input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Word count: {getWordCount(text)} / {WORD_LIMIT}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                className="button-primary"
                disabled={!text || isGenerating || profile?.subscription_status !== 'active'}
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
