'use client';

import { useMemo, useState } from 'react';
import { allZones } from '@/lib/tz';
import { useTimezone } from './TimezoneContext';

export default function TimezonePicker() {
  const { zone, setZone, ready } = useTimezone();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const zones = useMemo(() => {
    const all = allZones();
    if (!q) return all.slice(0, 200);
    const needle = q.toLowerCase().replace(/\s+/g, '_');
    return all.filter((z) => z.toLowerCase().includes(needle)).slice(0, 200);
  }, [q]);

  const label = ready ? zone.replace(/_/g, ' ') : 'detecting…';

  return (
    <div className="tzpicker">
      <button className="tzbutton" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        🕑 <strong>{label}</strong> <span className="muted">change</span>
      </button>
      {open && (
        <div className="tzpanel" role="dialog" aria-label="Choose timezone">
          <input
            autoFocus
            className="tzsearch"
            placeholder="Search city or zone (e.g. Karachi, Tokyo)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="tzlist">
            {zones.map((z) => (
              <li key={z}>
                <button
                  className={z === zone ? 'tzopt active' : 'tzopt'}
                  onClick={() => {
                    setZone(z);
                    setOpen(false);
                    setQ('');
                  }}
                >
                  {z.replace(/_/g, ' ')}
                </button>
              </li>
            ))}
            {zones.length === 0 && <li className="muted tzempty">No matching zones</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
