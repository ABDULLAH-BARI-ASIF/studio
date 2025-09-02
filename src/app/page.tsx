"use client";

import { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, Moon, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "next-themes";

import { fillInTheGaps, type FillInTheGapsOutput } from "@/ai/flows/fill-in-the-gaps-analysis";
import { generatePartOfSpeechDiagram, type PartOfSpeechDiagramOutput } from "@/ai/flows/part-of-speech-diagram-generation";
import { generateExtensiveExplanation, type ExtensiveExplanationInput, type ExtensiveExplanationOutput } from "@/ai/flows/extensive-explanation-generation";


import ResultDisplay from "@/components/ResultDisplay";
import ResultSkeleton from "@/components/ResultSkeleton";
import { useToast } from "@/hooks/use-toast";

type AnalysisResult = (FillInTheGapsOutput & { extensiveExplanation?: string }) | PartOfSpeechDiagramOutput;

const PRESET_API_KEY_1 = "AIzaSyBYk4kQ3cJYnZZM2OMZU5h9z4pqkHR4LdE";
const PRESET_API_KEY_2 = "AIzaSyDMgSW93xFVPjAYpggeIxunvzDdYO5Bipo";


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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    // Ensure this runs only on the client
    const storedApiKey = localStorage.getItem("gemini_api_key") || "";
    setApiKey(storedApiKey);
    if (!storedApiKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setIsSettingsOpen(false);
    toast({
        title: "API Key Saved",
        description: "Your Gemini API Key has been updated.",
    });
    // Force a reload to re-initialize Genkit with the new key
    window.location.reload();
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAnalysis = async () => {
    const storedApiKey = localStorage.getItem("gemini_api_key") || "";
    if (!storedApiKey) {
        toast({
            variant: "destructive",
            title: "API Key Required",
            description: "Please set your Gemini API key in the settings first.",
        });
        setIsSettingsOpen(true);
        return;
    }
    
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
        setAnalysisResult(result);
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
        description: "Something went wrong. Please check your API key and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setPosSentence("");
    setGapsQuestion("");
    setOptions(["", "", "", ""]);
    setAnalysisResult(null);
     toast({
        title: "Cleared",
        description: "Inputs and results have been cleared.",
    });
  }

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

  const handleModeChange = (checked: boolean) => {
      setMode(checked ? "gaps" : "pos");
      setAnalysisResult(null);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8 selection:bg-primary/20">
      <div className="w-full max-w-3xl space-y-8">
        <header className="relative text-center space-y-2 pt-8">
          <h1 
            className="font-title text-7xl font-extrabold tracking-wider text-foreground cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            grammalyzer
          </h1>
        </header>

        <div className="flex items-center justify-center space-x-4 py-4">
            <Label htmlFor="mode-switch" className={`flex-1 text-right text-base transition-colors ${mode === 'pos' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>POS analyzer</Label>
            <Switch
                id="mode-switch"
                checked={mode === 'gaps'}
                onCheckedChange={handleModeChange}
                aria-label="Switch between analyzer modes"
            />
            <Label htmlFor="mode-switch" className={`flex-1 text-left text-base transition-colors ${mode === 'gaps' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>QUE analyzer</Label>
        </div>

        {mode === 'pos' && (
            <Card className="border shadow-lg animate-in fade-in-0 duration-500">
                <CardContent className="p-6 space-y-4">
                    <Label className="text-sm font-medium text-muted-foreground font-headline">Enter a sentence to analyze</Label>
                    <Textarea
                    placeholder="Type your sentence here... e.g., 'The cat sat on the mat.'"
                    value={posSentence}
                    onChange={(e) => setPosSentence(e.target.value)}
                    className="min-h-[120px] resize-none text-base focus-visible:ring-primary font-headline"
                    />
                </CardContent>
            </Card>
        )}

        {mode === 'gaps' && (
            <Card className="border shadow-lg animate-in fade-in-0 duration-500">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium text-muted-foreground font-headline">Question</Label>
                  <Textarea id="question" placeholder="e.g., The cat sat _ the mat." value={gapsQuestion} onChange={e => setGapsQuestion(e.target.value)} className="min-h-[80px] focus-visible:ring-primary resize-y font-headline"/>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Input id="option-a" placeholder="A" value={options[0]} onChange={e => handleOptionChange(0, e.target.value)} className="focus-visible:ring-primary font-headline"/>
                  <Input id="option-b" placeholder="B" value={options[1]} onChange={e => handleOptionChange(1, e.target.value)} className="focus-visible:ring-primary font-headline"/>
                  <Input id="option-c" placeholder="C" value={options[2]} onChange={e => handleOptionChange(2, e.target.value)} className="focus-visible:ring-primary font-headline"/>
                  <Input id="option-d" placeholder="D" value={options[3]} onChange={e => handleOptionChange(3, e.target.value)} className="focus-visible:ring-primary font-headline"/>
                </div>
              </CardContent>
            </Card>
        )}


        <div className="flex justify-center">
            <Button
              onClick={handleAnalysis}
              disabled={isLoading || isGeneratingExplanation}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto font-headline"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
        </div>


        <div className="w-full">
          {isLoading && <ResultSkeleton />}
          {!isLoading && analysisResult && (
             <Card className="border shadow-lg">
                <CardContent className="p-6">
                    <ResultDisplay result={analysisResult} />
                </CardContent>
                {isGapsResult && !analysisResult.extensiveExplanation && (
                    <CardFooter>
                        <Button
                          onClick={handleExtensiveExplanation}
                          disabled={isGeneratingExplanation}
                          variant="outline"
                          className="w-full sm:w-auto ml-auto font-headline"
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
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                  <DialogTitle className="font-headline">Settings</DialogTitle>
                  <DialogDescription className="font-headline">
                      Manage your API and theme configurations here.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="api-key" className="font-headline">
                          Gemini API Key
                      </Label>
                       <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setApiKey(PRESET_API_KEY_1)}>Preset 1</Button>
                          <Button variant="outline" size="sm" onClick={() => setApiKey(PRESET_API_KEY_2)}>Preset 2</Button>
                        </div>
                      <Input
                          id="api-key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="col-span-3 font-headline"
                          type="password"
                      />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-headline">Theme</Label>
                        <div className="col-span-3 flex items-center">
                            <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </div>
                    </div>
              </div>
              <DialogFooter>
                  <Button type="submit" onClick={handleSaveApiKey} className="font-headline">Save changes</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
        <Button
            onClick={handleClear}
            variant="outline"
            size="icon"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl bg-background/80 backdrop-blur-sm hover:bg-primary/10"
            >
            <Trash2 className="h-6 w-6" />
            <span className="sr-only">Clear</span>
        </Button>
    </main>
  );
}
