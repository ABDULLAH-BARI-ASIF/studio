"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { fillInTheGaps } from "@/ai/flows/fill-in-the-gaps-analysis";
import { generatePartOfSpeechDiagram } from "@/ai/flows/part-of-speech-diagram-generation";
import ResultDisplay, { type AnalysisResult } from "@/components/ResultDisplay";
import ResultSkeleton from "@/components/ResultSkeleton";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [sentence, setSentence] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!sentence.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter a sentence to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const isFillInTheGap = /_|-/.test(sentence);
      let result: AnalysisResult;

      if (isFillInTheGap) {
        result = await fillInTheGaps({ sentence });
      } else {
        const diagramResult = await generatePartOfSpeechDiagram({ sentence });
        result = { partOfSpeechDiagram: diagramResult.diagram };
      }

      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description:
          "Something went wrong while analyzing the sentence. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-4xl font-bold text-primary sm:text-5xl">
            Q Analyzer
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your intelligent assistant for English grammar and sentence structure.
          </p>
        </header>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid w-full gap-4">
              <Textarea
                placeholder="Type your sentence here... e.g., 'The cat sat _ the mat.' or 'She can sing beautifully.'"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                className="min-h-[120px] resize-none text-base focus-visible:ring-accent"
              />
              <Button
                onClick={handleAnalysis}
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto sm:self-end"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {isLoading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="w-full">
          {isLoading && <ResultSkeleton />}
          {!isLoading && analysisResult && (
            <ResultDisplay result={analysisResult} />
          )}
        </div>
      </div>
    </main>
  );
}
