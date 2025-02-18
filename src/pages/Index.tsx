import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Download, Star, Image, Users, Github, Twitter, Linkedin } from "lucide-react";
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
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "generated-prompts.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Download started",
      description: "Your text file is being downloaded."
    });
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

        <Card className="max-w-4xl mx-auto p-6 md:p-8 mb-16">
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
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Word count: {getWordCount(text)} / {currentWordLimit}
                  {!isPremium && (
                    <span className="ml-2 text-primary">
                      (Free tier: {FREE_WORD_LIMIT} words)
                    </span>
                  )}
                </p>
                {text && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download as TXT
                  </Button>
                )}
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center animate-fade-in hover:shadow-lg transition-all">
            <Image className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">1,234</h3>
            <p className="text-muted-foreground">Images Generated</p>
          </Card>
          <Card className="p-6 text-center animate-fade-in hover:shadow-lg transition-all">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">789</h3>
            <p className="text-muted-foreground">Happy Users</p>
          </Card>
          <Card className="p-6 text-center animate-fade-in hover:shadow-lg transition-all">
            <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">4.9</h3>
            <p className="text-muted-foreground">Average Rating</p>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Generations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-accent/50 overflow-hidden hover:scale-105 transition-transform cursor-pointer animate-fade-in"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                  <Image className="w-8 h-8 text-primary/40" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Content Creator",
                comment: "This tool has revolutionized my content creation process!",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Video Producer",
                comment: "Saves me hours of work with precise image prompts.",
                rating: 5
              },
              {
                name: "Emma Davis",
                role: "Social Media Manager",
                comment: "The premium features are absolutely worth it.",
                rating: 4
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all animate-fade-in">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.comment}</p>
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </Card>
            ))}
          </div>
        </div>

        <footer className="border-t pt-16 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">About Us</h3>
              <p className="text-muted-foreground mb-4">
                We're dedicated to transforming your scripts into perfect image prompts,
                making content creation easier than ever.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Useful Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground py-4 border-t">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
