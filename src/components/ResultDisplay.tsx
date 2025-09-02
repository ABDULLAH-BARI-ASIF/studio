"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FillInTheGapsOutput } from "@/ai/flows/fill-in-the-gaps-analysis";
import type { PartOfSpeechDiagramOutput } from "@/ai/flows/part-of-speech-diagram-generation";
import { Separator } from "./ui/separator";

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
      <span>
        {parts[0]}
        <span className="font-bold text-primary">{answer}</span>
        {parts[1]}
      </span>
    );
  };

const ResultDisplay = ({ result }: ResultDisplayProps) => {

  if (isFillInTheGapsOutput(result)) {
    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500 font-bangla">
            
            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Question</p>
                <div className="text-foreground/90 text-lg leading-relaxed bg-muted p-4 rounded-md font-sans">
                  {renderAnsweredQuestion(result.question, result.correctAnswer)}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Brief Explanation (Bangla)</p>
                <p className="text-foreground/90 text-base leading-relaxed">{result.explanation}</p>
            </div>
            
            {result.extensiveExplanation && (
                <>
                <Separator />
                <div className="space-y-2 animate-in fade-in-0 duration-500">
                    <h3 className="text-lg font-semibold text-primary font-sans">Extensive Explanation</h3>
                    <p className="text-foreground/90 text-base whitespace-pre-wrap leading-relaxed">{result.extensiveExplanation}</p>
                </div>
                </>
            )}
        </div>
    );
  }

  // Part of Speech Diagram
  return (
    <div className="space-y-4 animate-in fade-in-0 duration-500">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
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
