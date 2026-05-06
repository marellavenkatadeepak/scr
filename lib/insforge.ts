import { createClient } from '@insforge/sdk';

const insforgeUrl = import.meta.env.VITE_INSFORGE_URL || '';
const insforgeAnonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || '';

if (!insforgeUrl || !insforgeAnonKey) {
  console.warn(
    'InsForge URL and Anon Key are required. Please set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in your .env file'
  );
}

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
