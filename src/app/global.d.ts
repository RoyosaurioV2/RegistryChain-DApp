export {};

declare global {
  interface Window {
    ethereum?: any; // Use 'any' for quick fix or a specific provider type for safety
  }
}