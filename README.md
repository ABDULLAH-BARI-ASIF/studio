# Grammalyzer

Grammalyzer is a powerful and intuitive tool for analyzing English sentences. Whether you're a student learning grammar or a linguist exploring sentence structure, Q Analyzer provides the insights you need.

This application is built with Next.js and Tailwind CSS, and it uses the Google Gemma 3 27B for its analysis capabilities.

## Features

- **Fill-in-the-Gaps Analyzer**: Detects sentences with blanks (`_` or `-`) and provides the correct word to complete them.
- **Grammar Rule Explanation**: For fill-in-the-gap questions, the tool provides a clear explanation of the relevant grammar rule in Bangla.
- **Part of Speech Diagram**: Generates a detailed diagram that breaks down each word in a sentence, identifying its part of speech (e.g., modal verbs, proper nouns, etc.).
- **Dual Mode**: Easily switch between the "Part of Speech" analyzer and the "Fill-in-the-Gaps" (QUE) analyzer.

## How to Deploy

This is a statically exported Next.js application, designed to be run on services like GitHub Pages.

1.  Run the build command: `npm run build`
2.  The output will be in the `out` directory.
3.  Deploy the contents of the `out` directory to your static hosting provider.
