use client;

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

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

// Client-side caller that posts to our server-side proxy at /api/openrouter
const callGenerativeAI = async (payload: any, jsonResponse: boolean = true) => {
  const res = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Proxy error:", errText);
    throw new Error(`Proxy request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();

  // Normalize the common OpenRouter/OpenAI-like response shapes into a text string
  let text = "";
  try {
    if (Array.isArray(data?.choices) && data.choices.length > 0) {
      const choice = data.choices[0];

      if (choice.message && typeof choice.message.content === "string") {
        text = choice.message.content;
      } else if (choice.message && typeof choice.message.content === "object") {
        if (Array.isArray(choice.message.content.parts)) {
          text = choice.message.content.parts.map((p: any) => p.text || p).join("");
        } else if (typeof choice.message.content.text === "string") {
          text = choice.message.content.text;
        } else {
          text = JSON.stringify(choice.message.content);
        }
      } else if (typeof choice.text === "string") {
        text = choice.text;
      } else {
        text = JSON.stringify(choice);
      }
    } else if (data?.output?.[0]?.content?.[0]?.text) {
      text = data.output[0].content[0].text;
    } else {
      text = JSON.stringify(data);
    }
  } catch (err) {
    console.warn("Normalization failed, returning raw JSON:", err);
    text = JSON.stringify(data);
  }

  if (jsonResponse) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } else {
    return text;
  }
};

export default function Home() {
  const [mode, setMode] = useState<"pos" | "gaps">("pos");

  // State for Parts of Speech
  const [posSentence, setPosSentence] = useState("");

  // State for Fill in the Gaps
  const [gapsQuestion, setGapsQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  // Use OPENROUTER_API_KEY now (client no longer needs the key for server-proxy flow)
  const [apiKey, setApiKey] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const { toast } = useToast();

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Keep reading from localStorage for backwards compatibility (UI may offer a place to paste a key).
    const storedApiKey = localStorage.getItem("OPENROUTER_API_KEY") || "";
    setApiKey(storedApiKey);
  }, []);

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
        const prompt = `You are an expert linguist. Generate a detailed part-of-speech analysis for the following sentence.\n\nReturn only valid JSON with the following schema:\n{\n  \"analysis\": [{\"word\":\"...\",\"partOfSpeech\":\"...\"}]\n}\n\nSentence:\n\"${posSentence}\"\n`;

        const payload = {
          model: "gemma-3-27b",
          messages: [
            { role: "system", content: "You are an expert linguist. Provide the requested analysis in JSON when asked." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
        };

        const result = await callGenerativeAI(payload, true);
        setAnalysisResult(result as AnalysisResult);
      } else {
        const prompt = `You are an expert linguist. For the following fill-in-the-gaps question return JSON only with keys: question, correctAnswer, explanation.\nQuestion: \"${gapsQuestion}\"\nOptions: ${JSON.stringify(options)}\n`;

        const payload = {
          model: "gemma-3-27b",
          messages: [
            { role: "system", content: "You are an expert linguist. Provide the requested analysis in JSON when asked." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
        };

        const result = await callGenerativeAI(payload, true);
        setAnalysisResult(result as AnalysisResult);
      }
    } catch (err: any) {
      console.error("Error generating analysis:", err);
      toast({ variant: "destructive", title: "API Error", description: err?.message || String(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* existing UI components should render here; unchanged from previous implementation */}
    </div>
  );
}