import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  user: GoogleUser | null;
  credential: string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({ user: null, credential: null, signOut: () => {} });

declare global {
  interface Window { google: any }
}

function parseJwt(token: string) {
  return JSON.parse(atob(token.split('.')[1]));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [credential, setCredential] = useState<string | null>(null);

  const handleCredential = useCallback((token: string) => {
    const p = parseJwt(token);
    setCredential(token);
    setUser({ sub: p.sub, email: p.email, name: p.name, picture: p.picture });
    sessionStorage.setItem('g_cred', token);
    fetch(`${import.meta.env.VITE_WORKER_URL}/me`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  // Restore session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('g_cred');
    if (!saved) return;
    try {
      const p = parseJwt(saved);
      if (p.exp * 1000 > Date.now()) {
        handleCredential(saved);
      } else {
        sessionStorage.removeItem('g_cred');
      }
    } catch {
      sessionStorage.removeItem('g_cred');
    }
  }, []);

  // Initialize Google GSI (guard against StrictMode double-invoke)
  useEffect(() => {
    let initialized = false;
    const init = () => {
      if (initialized) return;
      initialized = true;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (res: { credential: string }) => handleCredential(res.credential),
      });
    };

    if (window.google?.accounts) {
      init();
    } else {
      const script = document.querySelector<HTMLScriptElement>('script[src*="accounts.google.com/gsi"]');
      if (script) script.addEventListener('load', init);
    }
  }, [handleCredential]);

  const signOut = useCallback(() => {
    setUser(null);
    setCredential(null);
    sessionStorage.removeItem('g_cred');
    window.google?.accounts.id.disableAutoSelect();
  }, []);

  return (
    <AuthContext.Provider value={{ user, credential, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
