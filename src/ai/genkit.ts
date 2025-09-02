import {genkit, GenerationCommonConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This function is defined in a global scope in a script tag on the page.
// It's a bit of a hack to get the API key from local storage into the
// Genkit configuration.
declare function getApiKey(): string | null;

let apiKey: string | undefined = undefined;
if (typeof window !== 'undefined') {
  apiKey = localStorage.getItem('gemini_api_key') || undefined;
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
  // In order to enable the client to use a dynamic API key, we need to provide
  // a custom fetch implementation that sets the key on each request.
  customFetch: async (
    url: RequestInfo | URL,
    options?: RequestInit
  ): Promise<Response> => {
    let apiKey: string | null = null;
    if (typeof window !== 'undefined') {
      apiKey = localStorage.getItem('gemini_api_key');
    }
    const headers = new Headers(options?.headers);
    if (apiKey) {
      const urlString = url.toString();
      if (urlString.includes('googleapis.com')) {
        url = `${urlString}?key=${apiKey}`;
      }
    }
    return fetch(url, {...options, headers});
  },
});

    