'use client';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey:
        typeof window !== 'undefined'
          ? window.localStorage.getItem('gemini_api_key') || ''
          : '',
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
        const urlWithKey = new URL(urlString);
        urlWithKey.searchParams.set('key', apiKey);
        url = urlWithKey;
      }
    }
    return fetch(url, {...options, headers});
  },
});
