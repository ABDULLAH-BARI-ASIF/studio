"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fragment } from "react";

export type AnalysisResult = {
  completedSentence?: string;
  grammarRuleExplanation?: string;
  partOfSpeechDiagram: string;
};

type ResultDisplayProps = {
  result: AnalysisResult;
};

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const sections = [
    {
      title: "Completed Sentence",
      content: result.completedSentence,
      isCode: false,
    },
    {
      title: "Grammar Rule (Bangla)",
      content: result.grammarRuleExplanation,
      isCode: false,
    },
    {
      title: "Part of Speech Diagram",
      content: result.partOfSpeechDiagram,
      isCode: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 font-body">
      {sections.map(
        (section) =>
          section.content && (
            <Fragment key={section.title}>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.isCode ? (
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                      <code>{section.content}</code>
                    </pre>
                  ) : (
                    <p className="text-foreground/90 text-base leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Fragment>
          )
      )}
    </div>
  );
};

export default ResultDisplay;
