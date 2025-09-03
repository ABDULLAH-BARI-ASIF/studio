"use client";

import { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

import ResultDisplay from "@/components/ResultDisplay";
import ResultSkeleton from "@/components/ResultSkeleton";
import { useToast } from "@/hooks/use-toast";

// TYPE DEFINITIONS
export type PartOfSpeechDiagramOutput = {
  analysis: { word: string; partOfSpeech: string }[];
};

export type FillInTheGapsOutput = {
  question: string;
  correctAnswer: string;
  explanation: string;
};

export type ExtensiveExplanationOutput = {
  explanation: string;
};

type AnalysisResult = (FillInTheGapsOutput & { extensiveExplanation?: string }) | PartOfSpeechDiagramOutput;

const callGenerativeAI = async (apiKey: string, prompt: string, jsonResponse: boolean = true) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const headers = { 'Content-Type': 'application/json' };
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: jsonResponse ? { response_mime_type: 'application/json' } : {},
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
};


export default function Home() {
  const [mode, setMode] = useState<"pos" | "gaps">("pos");
  
  // State for Parts of Speech
  const [posSentence, setPosSentence] = useState("");
  
  // State for Fill in the Gaps
  const [gapsQuestion, setGapsQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  const [apiKey, setApiKey] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const { toast } = useToast();

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key") || "AIzaSyC6-XqrGZ6JQbV3kzziK5EED00b9tORhMw";
    setApiKey(storedApiKey);
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAnalysis = async () => {
    if (!apiKey) {
      toast({ variant: "destructive", title: "API Key is missing", description: "Please set your Gemini API key." });
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
        const prompt = `You are an expert linguist. Generate a detailed part-of-speech analysis for the following sentence. 
  
Your analysis must be thorough. Identify not just basic parts of speech, but also more specific categories like:
- Proper nouns
- Tenses (e.g., present continuous, past perfect)
- Modal verbs
- Articles
- Conjunctions (coordinating, subordinating)
- Prepositions
- Interjections

Return the analysis as a JSON object that adheres to this structure: { "analysis": [{ "word": "string", "partOfSpeech": "string" }] }

Sentence: ${posSentence}`;
        
        const result: PartOfSpeechDiagramOutput = await callGenerativeAI(apiKey, prompt);
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

        let optionsText = "";
        if (filledOptions.length > 0) {
            optionsText = `Options:\n- ${filledOptions.join('\n- ')}`;
        }

        const prompt = `You are an expert English grammar tutor.

You will be given a sentence with a blank indicated by an underscore "_" or a hyphen "-". You may also be given a list of options.

Your task is to:
1.  Determine the correct word or phrase to fill in the blank. If options are provided, choose the correct one.
2.  Provide a brief explanation in Bangla of the grammar rule that applies to the sentence.
3.  Return the original question in your response.

Return a JSON object matching this structure: { "question": "string", "correctAnswer": "string", "explanation": "string" }

Question: ${gapsQuestion}

${optionsText}
`;
        const result: FillInTheGapsOutput = await callGenerativeAI(apiKey, prompt);
        setAnalysisResult({...result, question: gapsQuestion});
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
        const prompt = `You are an expert English grammar tutor. You will be given a sentence with a blank, the options provided, and the correct answer. Your response should use markdown for formatting, but you must not use '#' for headings or '*' for bold/italics.

Your task is to provide an advanced, detailed explanation in Bangla about why the correct answer is the right fit, explaining the relevant grammar rule in detail. 

Also, include some clear examples to illustrate the grammar rule. Always wrap the examples between two markdown horizontal rules like this:
---
Example 1...
Example 2...
---

Do not explain why the other options are incorrect.

Return a JSON object matching this structure: { "explanation": "string" }

Question: ${analysisResult.question}
Options: ${options.filter(opt => opt.trim() !== '').join(', ')}
Correct Answer: ${analysisResult.correctAnswer}
`;

        const result: ExtensiveExplanationOutput = await callGenerativeAI(apiKey, prompt);
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
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
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
