// language: tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Download, Image, Coffee } from "lucide-react";
import { processText } from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { apiKeys } from "../config/apikeys";

const WORD_LIMIT = 10000;

const providers = [
  { key: "chatgpt", name: "ChatGPT" },
  { key: "claude", name: "Claude" },
  { key: "gemini", name: "Gemini" },
  { key: "deepseek", name: "DeepSeek" },
];

const Index = () => {
  const [text, setText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagesPerMinute, setImagesPerMinute] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState("");
  const { toast } = useToast();

  const availableProviders = providers.filter(
    (provider) => apiKeys[provider.key as keyof typeof apiKeys]
  );

  const getWordCount = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const wordCount = getWordCount(newText);

    if (wordCount > WORD_LIMIT) {
      toast({
        title: "Word limit exceeded",
        description: `Please keep your text under ${WORD_LIMIT} words`,
        variant: "destructive",
      });
      return;
    }

    setText(newText);
  };

  const handleGenerate = async () => {
    const wordCount = getWordCount(text);

    if (wordCount > WORD_LIMIT) {
      toast({
        title: "Word limit exceeded",
        description: `Please keep your text under ${WORD_LIMIT} words`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await processText(text);
      setProcessedText(result.processed_text);
      toast({
        title: "Success",
        description: "Text processed successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to process text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTxt = () => {
    const content = processedText || text;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "generated-prompts.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Download started",
      description: "Your text file is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background relative">
      {/* Floating Buy Me a Coffee Button */}
      <a
        href="https://www.buymeacoffee.com/yourusername"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center z-50"
      >
        <Coffee className="w-5 h-5 mr-2" />
        Buy me a coffee
      </a>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Transform Text into Visual Prompts
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Generate perfect image prompts from your video scripts and
            transcriptions in seconds.
          </p>
        </div>
        {/* Images per minute input */}
        <div className="max-w-4xl mx-auto p-4 md:p-2 flex flex-col md:flex-row gap-4">
          {/* Images per minute input */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-2">
              Images per minute
            </label>
            <input
              type="number"
              min={1}
              value={imagesPerMinute}
              onChange={(e) => setImagesPerMinute(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Provider selection */}
          <div className="w-full md:w-2/3">
            <label className="block text-sm font-medium mb-2">
              Select AI Provider
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="" disabled>
                Select an AI Provider
              </option>
              {availableProviders.map((provider) => (
                <option key={provider.key} value={provider.key}>
                  {provider.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Only providers with API keys configured in <code>apiKeys.ts</code>{" "}
              will appear.
            </p>
          </div>
        </div>
        <Card className="max-w-4xl mx-auto p-6 md:p-8 mb-16">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Script or Transcription
              </label>
              <Textarea
                placeholder={`Paste your text here (max ${WORD_LIMIT} words)...`}
                className="min-h-[500px]"
                value={text}
                onChange={handleTextChange}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Word count: {getWordCount(text)} / {WORD_LIMIT}
                </p>
                <p className="text-sm text-muted-foreground">
                  Time estimated of video: {Math.ceil(getWordCount(text) / 150)}{" "}
                  min
                </p>
              </div>
            </div>

            {processedText && (
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Processed Text
                </label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="whitespace-pre-wrap">{processedText}</div>
                </ScrollArea>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleGenerate}
                className="w-full sm:w-auto"
                disabled={!text || isGenerating}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {isGenerating ? "Processing..." : "Process Text"}
              </Button>

              {(text || processedText) && (
                <Button
                  variant="outline"
                  onClick={handleDownloadTxt}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download as TXT
                </Button>
              )}
            </div>
          </div>
        </Card>

        <footer className="border-t pt-16 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">About Us</h3>
              <p className="text-muted-foreground mb-4">
                We're dedicated to transforming your scripts into perfect image
                prompts, making content creation easier than ever.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Useful Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Image className="w-6 h-6" />
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
