"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

// These types are now local to the components that use them
// as they are no longer exported from server-side files.
export type PartOfSpeechDiagramOutput = {
  analysis: { word: string; partOfSpeech: string }[];
};

export type FillInTheGapsOutput = {
  question: string;
  correctAnswer: string;
  explanation: string;
};

type AnalysisResult = (FillInTheGapsOutput & { extensiveExplanation?: string }) | PartOfSpeechDiagramOutput;


type ResultDisplayProps = {
  result: AnalysisResult;
};

function isFillInTheGapsOutput(result: AnalysisResult): result is FillInTheGapsOutput & { extensiveExplanation?: string } {
    return 'correctAnswer' in result;
}

const renderAnsweredQuestion = (question: string, answer: string) => {
    const parts = question.split(/_|-/);
    if (parts.length < 2) {
      return <span>{question}</span>;
    }
    return (
      <span className="font-sans">
        {parts[0]}
        <span className="font-bold text-primary">{answer}</span>
        {parts.slice(1).join(' ')}
      </span>
    );
  };

const ResultDisplay = ({ result }: ResultDisplayProps) => {

  if (isFillInTheGapsOutput(result)) {
    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500 font-sans">
            
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground font-headline">Answer</p>
                <div className="text-foreground/90 text-lg leading-relaxed bg-muted p-4 rounded-md">
                  {renderAnsweredQuestion(result.question, result.correctAnswer)}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground font-headline">Simple Explanation</p>
                <p className="text-foreground/90 text-base leading-relaxed">{result.explanation}</p>
            </div>
            
            {result.extensiveExplanation && (
                <>
                <Separator />
                <div className="space-y-2 animate-in fade-in-0 duration-500">
                    <h3 className="text-lg font-semibold text-primary font-headline">Extensive Explanation</h3>
                    <div 
                      className="text-foreground/90 text-base whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: result.extensiveExplanation.replace(/---/g, '<hr class="my-4 border-border" />') }} 
                    />
                </div>
                </>
            )}
        </div>
    );
  }

  // Part of Speech Diagram
  return (
    <div className="space-y-4 animate-in fade-in-0 duration-500 font-sans">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-headline">
            Part of Speech Analysis
        </h2>
        <div className="space-y-3 rounded-lg bg-muted p-4">
            {result.analysis.map((item, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-baseline gap-2 text-base">
                        <span 
                            className="font-bold text-lg text-primary w-32"
                        >
                            {item.word}
                        </span>
                        <span className="text-muted-foreground font-medium ">:</span>
                        <span className="text-foreground/90">{item.partOfSpeech}</span>
                    </div>
                    {index < result.analysis.length -1 && <Separator className="my-2"/>}
                </React.Fragment>
            ))}
        </div>
    </div>
  );
};

export default ResultDisplay;
