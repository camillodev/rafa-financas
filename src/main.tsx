
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from "@clerk/clerk-react";
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_bGVhcm5pbmctd2VyZXdvbGYtNzkuY2xlcmsuYWNjb3VudHMuZGV2JA";
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    clerkJSVersion="5.56.0-snapshot.v20250312225817"
    tokenCache={(cache) => ({
      ...cache,
      getToken: async (options) => {
        // Custom token cache implementation to support Supabase template
        const token = await cache.getToken(options);
        return token;
      }
    })}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInFallbackRedirectUrl="/dashboard"
    signUpFallbackRedirectUrl="/"
    signInForceRedirectUrl="/"
    signUpForceRedirectUrl="/"
    afterSignOutUrl="/"
  >
    <App />
  </ClerkProvider>
);
