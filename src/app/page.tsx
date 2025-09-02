"use client";

import { useState } from "react";
import { Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { fillInTheGaps, type FillInTheGapsOutput } from "@/ai/flows/fill-in-the-gaps-analysis";
import { generatePartOfSpeechDiagram, type PartOfSpeechDiagramOutput } from "@/ai/flows/part-of-speech-diagram-generation";
import { generateExtensiveExplanation, type ExtensiveExplanationInput, type ExtensiveExplanationOutput } from "@/ai/flows/extensive-explanation-generation";


import ResultDisplay from "@/components/ResultDisplay";
import ResultSkeleton from "@/components/ResultSkeleton";
import { useToast } from "@/hooks/use-toast";

type AnalysisResult = (FillInTheGapsOutput & { extensiveExplanation?: string }) | { diagram: string };

export default function Home() {
  const [mode, setMode] = useState<"pos" | "gaps">("pos");
  
  // State for Parts of Speech
  const [posSentence, setPosSentence] = useState("");
  
  // State for Fill in the Gaps
  const [gapsQuestion, setGapsQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
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

  const handleExtensiveExplanation = async () => {
    if (!analysisResult || !('correctAnswer' in analysisResult)) return;

    setIsGeneratingExplanation(true);
    try {
        const input: ExtensiveExplanationInput = {
            question: analysisResult.question,
            options: options.filter(opt => opt.trim() !== ''),
            correctAnswer: analysisResult.correctAnswer
        };
        const result: ExtensiveExplanationOutput = await generateExtensiveExplanation(input);
        setAnalysisResult(prev => {
            if (prev && 'correctAnswer' in prev) {
                return {...prev, extensiveExplanation: result.explanation};
            }
            return prev;
        })

    } catch (error) {
        console.error("Extensive explanation failed:", error);
        toast({
            variant: "destructive",
            title: "Explanation Failed",
            description: "Could not generate a more detailed explanation. Please try again.",
        });
    } finally {
        setIsGeneratingExplanation(false);
    }
  };
  
  const isGapsResult = analysisResult && 'correctAnswer' in analysisResult;

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8 selection:bg-primary/20">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center space-y-2">
           <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
            English Grammar AI
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
            Q Analyzer
          </h1>
          <p className="text-lg text-muted-foreground">
            Your intelligent assistant for sentence structures and grammar explanations.
          </p>
        </header>

        <Tabs defaultValue="pos" onValueChange={(value) => {setMode(value as "pos" | "gaps"); setAnalysisResult(null);}} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="pos">Parts of Speech Analyzer</TabsTrigger>
            <TabsTrigger value="gaps">Fill in the Gaps Explainer</TabsTrigger>
          </TabsList>
          <TabsContent value="pos" className="mt-6">
            <Card className="border-0 bg-secondary shadow-lg">
              <CardContent className="p-6 space-y-4">
                <Textarea
                  placeholder="Type your sentence here... e.g., 'The cat sat on the mat.'"
                  value={posSentence}
                  onChange={(e) => setPosSentence(e.target.value)}
                  className="min-h-[120px] resize-none border-border/50 bg-background/50 text-base focus-visible:ring-primary"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gaps" className="mt-6">
            <Card className="border-0 bg-secondary shadow-lg">
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="question" className="text-sm font-medium text-muted-foreground">Question</Label>
                    <Input id="question" placeholder="e.g., The cat sat _ the mat." value={gapsQuestion} onChange={e => setGapsQuestion(e.target.value)} className="border-border/50 bg-background/50 focus-visible:ring-primary"/>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="option-a" className="text-sm font-medium text-muted-foreground">Option A (optional)</Label>
                        <Input id="option-a" placeholder="e.g., on" value={options[0]} onChange={e => handleOptionChange(0, e.target.value)} className="border-border/50 bg-background/50 focus-visible:ring-primary"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="option-b" className="text-sm font-medium text-muted-foreground">Option B (optional)</Label>
                        <Input id="option-b" placeholder="e.g., in" value={options[1]} onChange={e => handleOptionChange(1, e.target.value)} className="border-border/50 bg-background/50 focus-visible:ring-primary"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="option-c" className="text-sm font-medium text-muted-foreground">Option C (optional)</Label>
                        <Input id="option-c" placeholder="e.g., at" value={options[2]} onChange={e => handleOptionChange(2, e.target.value)} className="border-border/50 bg-background/50 focus-visible:ring-primary"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="option-d" className="text-sm font-medium text-muted-foreground">Option D (optional)</Label>
                        <Input id="option-d" placeholder="e.g., under" value={options[3]} onChange={e => handleOptionChange(3, e.target.value)} className="border-border/50 bg-background/50 focus-visible:ring-primary"/>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
            <Button
              onClick={handleAnalysis}
              disabled={isLoading || isGeneratingExplanation}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
        </div>


        <div className="w-full">
          {isLoading && <ResultSkeleton />}
          {!isLoading && analysisResult && (
             <Card className="border-0 bg-secondary shadow-lg">
                <CardContent className="p-6">
                    <ResultDisplay result={analysisResult} />
                </CardContent>
                {isGapsResult && !analysisResult.extensiveExplanation && (
                    <CardFooter>
                        <Button
                          onClick={handleExtensiveExplanation}
                          disabled={isGeneratingExplanation}
                          variant="outline"
                          className="w-full sm:w-auto ml-auto"
                        >
                          <BrainCircuit className="mr-2 h-5 w-5" />
                          {isGeneratingExplanation ? "Generating..." : "Extensive Explanation"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
