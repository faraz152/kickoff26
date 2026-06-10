'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { detectZone } from '@kickoff26/core';

const KEY = 'kickoff26-tz';

interface Ctx {
  zone: string;
  setZone: (z: string) => void;
  ready: boolean; // false until we've resolved the real zone on the client
}

const TimezoneCtx = createContext<Ctx>({ zone: 'UTC', setZone: () => {}, ready: false });

export function TimezoneProvider({ children }: { children: ReactNode }) {
  // Server + first client render agree on 'UTC' (no hydration mismatch); the real zone is resolved
  // in the effect below, then everything re-renders in the user's local time.
  const [zone, setZoneState] = useState('UTC');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || detectZone();
    setZoneState(saved);
    setReady(true);
  }, []);

  function setZone(z: string) {
    setZoneState(z);
    try {
      localStorage.setItem(KEY, z);
    } catch {
      /* private mode / blocked storage — keep the in-memory choice */
    }
  }

  return <TimezoneCtx.Provider value={{ zone, setZone, ready }}>{children}</TimezoneCtx.Provider>;
}

export const useTimezone = () => useContext(TimezoneCtx);
