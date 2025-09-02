"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fragment } from "react";
import { FillInTheGapsOutput } from "@/ai/flows/fill-in-the-gaps-analysis";

type AnalysisResult = FillInTheGapsOutput | { diagram: string };

type ResultDisplayProps = {
  result: AnalysisResult;
};

function isFillInTheGapsOutput(result: AnalysisResult): result is FillInTheGapsOutput {
    return 'correctAnswer' in result;
}

const ResultDisplay = ({ result }: ResultDisplayProps) => {

  if (isFillInTheGapsOutput(result)) {
    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500 font-body">
            <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Correct Answer</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground/90 text-base leading-relaxed">{result.correctAnswer}</p>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Explanation (Bangla)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground/90 text-base leading-relaxed">{result.explanation}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  // Part of Speech Diagram
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 font-body">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-primary">
                Part of Speech Diagram
                </CardTitle>
            </CardHeader>
            <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{result.diagram}</code>
                </pre>
            </CardContent>
        </Card>
    </div>
  );
};

export default ResultDisplay;
