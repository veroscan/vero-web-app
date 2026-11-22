import type { MeResponse } from '@vero/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setApiToken, setSignedOutHandler } from './api';
import { storage } from './storage';

const KEY = 'vero.session';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface SessionValue {
  status: Status;
  me: MeResponse | null;
  /** Uses a sign-in link's token. Returns whether this is a brand-new account. */
  signInWithToken: (linkToken: string) => Promise<{ isNewUser: boolean; mfaRequired: boolean }>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<MeResponse | null>;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Holds who is signed in. The session token is kept in the phone's secure store and sent as a
 * Bearer token; the API checks it on every call, so signing out anywhere takes effect here too.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const queries = useQueryClient();
  const [status, setStatus] = useState<Status>('loading');
  const [me, setMe] = useState<MeResponse | null>(null);

  const clear = useCallback(async () => {
    setApiToken(null);
    await storage.remove(KEY);
    queries.clear();
    setMe(null);
    setStatus('signedOut');
  }, [queries]);

  const refreshMe = useCallback(async () => {
    try {
      const next = await api.me.get();
      setMe(next);
      setStatus('signedIn');
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setSignedOutHandler(() => {
      void clear().then(() => router.replace('/welcome'));
    });
    void (async () => {
      const saved = await storage.get(KEY);
      if (!saved) {
        setStatus('signedOut');
        return;
      }
      setApiToken(saved);
      const loaded = await refreshMe();
      if (!loaded) await clear();
    })();
    return () => setSignedOutHandler(null);
  }, [clear, refreshMe]);

  const signInWithToken = useCallback(
    async (linkToken: string) => {
      const result = await api.auth.verifyMagicLink({ body: { token: linkToken } });
      if (!result.sessionToken) throw new Error('The API did not return a session for the app.');
      setApiToken(result.sessionToken);
      await storage.set(KEY, result.sessionToken);
      await refreshMe();
      return { isNewUser: result.isNewUser, mfaRequired: result.mfaRequired };
    },
    [refreshMe],
  );

  const signOut = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      /* the session may already be gone; sign out here regardless */
    }
    await clear();
  }, [clear]);

  const value = useMemo(() => ({ status, me, signInWithToken, signOut, refreshMe }), [status, me, signInWithToken, signOut, refreshMe]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
