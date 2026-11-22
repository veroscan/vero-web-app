import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/lib/session';
import { useWorkspace, workspaceKey } from '@/lib/workspace';

/**
 * Where someone goes once signed in: finding their company when they are new or have none,
 * otherwise the Overview tab. Waits for the workspace so it never guesses.
 */
export function useAfterSignIn() {
  const { status } = useSession();
  const queries = useQueryClient();
  const workspace = useWorkspace();
  const [pending, setPending] = useState<{ isNewUser: boolean } | null>(null);

  useEffect(() => {
    if (!pending || status !== 'signedIn') return;
    if (workspace.isError) {
      router.replace(pending.isNewUser ? '/search' : '/(tabs)');
      return;
    }
    if (!workspace.isSuccess || workspace.isFetching) return;
    router.replace(pending.isNewUser || !workspace.data.root ? '/search' : '/(tabs)');
  }, [pending, status, workspace.isError, workspace.isSuccess, workspace.isFetching, workspace.data]);

  const go = useCallback(
    (isNewUser: boolean) => {
      void queries.invalidateQueries({ queryKey: workspaceKey });
      setPending({ isNewUser });
    },
    [queries],
  );

  return { go, routing: pending !== null };
}
