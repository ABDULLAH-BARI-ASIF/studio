"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { fillInTheGaps, FillInTheGapsOutput } from "@/ai/flows/fill-in-the-gaps-analysis";
import { generatePartOfSpeechDiagram, PartOfSpeechDiagramOutput } from "@/ai/flows/part-of-speech-diagram-generation";

import ResultDisplay from "@/components/ResultDisplay";
import ResultSkeleton from "@/components/ResultSkeleton";
import { useToast } from "@/hooks/use-toast";

type AnalysisResult = FillInTheGapsOutput | { diagram: string };

export default function Home() {
  const [mode, setMode] = useState<"pos" | "gaps">("pos");
  
  // State for Parts of Speech
  const [posSentence, setPosSentence] = useState("");
  
  // State for Fill in the Gaps
  const [gapsQuestion, setGapsQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAnalysis = async () => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      if (mode === 'pos') {
        if (!posSentence.trim()) {
          toast({ variant: "destructive", title: "Input required", description: "Please enter a sentence." });
          setIsLoading(false);
          return;
        }
        const result: PartOfSpeechDiagramOutput = await generatePartOfSpeechDiagram({ sentence: posSentence });
        setAnalysisResult({ diagram: result.diagram });
      } else { // mode === 'gaps'
        if (!gapsQuestion.trim()) {
          toast({ variant: "destructive", title: "Input required", description: "Please enter a question." });
          setIsLoading(false);
          return;
        }
        if (!gapsQuestion.includes('_') && !gapsQuestion.includes('-')) {
            toast({ variant: "destructive", title: "Invalid question", description: "The question must contain a '_' or '-' for the gap." });
            setIsLoading(false);
            return;
        }
        const filledOptions = options.filter(opt => opt.trim() !== '');
        const result: FillInTheGapsOutput = await fillInTheGaps({ question: gapsQuestion, options: filledOptions.length > 0 ? filledOptions : undefined });
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Something went wrong. Please try again.",
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
            Your intelligent assistant for English grammar.
          </p>
        </header>

        <Tabs defaultValue="pos" onValueChange={(value) => setMode(value as "pos" | "gaps")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pos">Parts of Speech Analyzer</TabsTrigger>
            <TabsTrigger value="gaps">Fill in the Gaps Explainer</TabsTrigger>
          </TabsList>
          <TabsContent value="pos">
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-4">
                <Textarea
                  placeholder="Type your sentence here... e.g., 'The cat sat on the mat.'"
                  value={posSentence}
                  onChange={(e) => setPosSentence(e.target.value)}
                  className="min-h-[120px] resize-none text-base focus-visible:ring-accent"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gaps">
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Input id="question" placeholder="e.g., The cat sat _ the mat." value={gapsQuestion} onChange={e => setGapsQuestion(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="option-a">Option A (optional)</Label>
                        <Input id="option-a" placeholder="e.g., on" value={options[0]} onChange={e => handleOptionChange(0, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="option-b">Option B (optional)</Label>
                        <Input id="option-b" placeholder="e.g., in" value={options[1]} onChange={e => handleOptionChange(1, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="option-c">Option C (optional)</Label>
                        <Input id="option-c" placeholder="e.g., at" value={options[2]} onChange={e => handleOptionChange(2, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="option-d">Option D (optional)</Label>
                        <Input id="option-d" placeholder="e.g., under" value={options[3]} onChange={e => handleOptionChange(3, e.target.value)} />
                    </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
            <Button
              onClick={handleAnalysis}
              disabled={isLoading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
        </div>


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
