# **App Name**: Q Analyzer

## Core Features:

- Sentence Input: Allows the user to input a sentence into a text field.
- Fill-in-the-Gaps Analyzer: Detects if the sentence has a 'fill in the gap' format (using '_' or '-'). If detected, the tool uses the Gemini API to provide the correct answer. Use markdown formatting.
- Grammar Rule Explanation: If the sentence is a 'fill in the gap' question, the tool uses the Gemini API to provide the grammar rule used in the sentence in Bangla.
- Part of Speech Diagram: Generates a detailed diagram analyzing each part of speech in the sentence, identifying elements such as modal verbs and proper nouns.
- Check Button: A button that triggers the Gemini API analysis when pressed.
- Result Display: Displays the analysis results (answer, grammar rule, part of speech diagram) in a clear and organized format below the input field. Use Markdown formatting.

## Style Guidelines:

- Primary color: Dark slate blue (#3B4252), reminiscent of ink on paper and chosen for a scholarly, analytical mood.
- Background color: Very light gray (#F0F2F5) providing a subtle backdrop that doesn't distract from the content.
- Accent color: Muted orange (#D08770) is used sparingly for the 'Check' button and highlights, complementing the primary and background while indicating interactivity.
- Font pairing: 'Literata' (serif) for main text and 'Inter' (sans-serif) for UI elements.
- Minimal, outline-style icons for navigation and interactive elements.
- Material You 3 inspired design with rounded corners and adaptable elements.
- Subtle fade-in animations for analysis results.