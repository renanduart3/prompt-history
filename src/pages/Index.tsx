
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";

const Index = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
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
        </div>

        {/* Main Card */}
        <Card className="max-w-4xl mx-auto p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Script or Transcription
              </label>
              <Textarea
                placeholder="Paste your text here (max 6,250 words)..."
                className="min-h-[200px] input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
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
