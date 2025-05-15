export const CACHE_EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// API retry configurations (example values, adjust as needed)
export const MAX_RETRIES = 2; // Max number of retries for API calls
export const RETRY_BASE_DELAY_MS = 1000; // Base delay in ms for retries, often used with exponential backoff

// Famous quotes - This will be removed
/*
export const famousQuotes = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  // ... more quotes
];
*/

// It's good practice to keep constants that are highly specific to a feature 
// (like TianAPI keys or specific cache keys for TianAPI data) closer to where they are used,
// or manage them via environment variables if they are sensitive or environment-dependent.

// For instance, API keys should ideally be in .env files and accessed via import.meta.env.VITE_YOUR_KEY_NAME.
// Cache keys that are very specific to a hook or service can be defined within that hook/service file. 