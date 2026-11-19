'use client';

/* "Scan again" on the Findings page: asks every company in view to be scanned afresh, follows the
   scans until they finish, then lets the page reload what Vero found. */

import type { Scan } from '@vero/shared';
import { useEffect, useRef, useState } from 'react';
import { api, asApiError, isRedirecting } from '@/lib/api';

const FINISHED = new Set<Scan['status']>(['partial', 'completed', 'failed']);

export function useScanAgain(companyIds: readonly string[], onDone: () => void) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [running, setRunning] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const done = useRef(onDone);
  done.current = onDone;

  const start = () => {
    if (running || companyIds.length === 0) return;
    setProblem(null);
    setRunning(true);
    Promise.all(companyIds.map((companyId) => api.scans.create({ params: { companyId } }))).then(setScans, (failure: unknown) => {
      setRunning(false);
      if (!isRedirecting(failure)) setProblem(asApiError(failure).message);
    });
  };

  const moving = scans.filter((scan) => !FINISHED.has(scan.status));
  const key = moving.map((scan) => `${scan.id}:${scan.status}:${scan.checksDone}`).join(',');
  useEffect(() => {
    if (!running || scans.length === 0) return;
    if (moving.length === 0) {
      setRunning(false);
      setScans([]);
      done.current();
      return;
    }
    const timer = window.setTimeout(
      () => {
        Promise.all(moving.map((scan) => api.scans.get({ params: { scanId: scan.id } }))).then(
          (fresh) => setScans((list) => list.map((scan) => fresh.find((item) => item.id === scan.id) ?? scan)),
          (failure: unknown) => {
            setRunning(false);
            if (!isRedirecting(failure)) setProblem(asApiError(failure).message);
          },
        );
      },
      Math.max(800, ...moving.map((scan) => scan.pollAfterMs)),
    );
    return () => window.clearTimeout(timer);
    // `key` stands for the scans still moving.
  }, [key, running, scans.length]);

  const total = scans.reduce((sum, scan) => sum + scan.checksTotal, 0);
  const checked = scans.reduce((sum, scan) => sum + (FINISHED.has(scan.status) ? scan.checksTotal : scan.checksDone + scan.checksDown), 0);
  return { running, problem, checked, total, start };
}
