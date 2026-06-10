export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';
export type Status = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: number;
  stage: Stage;
  round: string;
  group: string | null;
  kickoff_utc: string;
  venue_id: string;
  team1: string; // team slug, or a placeholder like "1A" / "W74" / "3A/B/C/D/F"
  team2: string;
  score: { ft: [number | null, number | null]; ht: [number | null, number | null]; et: unknown; pens: unknown };
  status: Status;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  fifa_rank: number;
  group: string | null;
  confederation: string;
}

export interface Group {
  id: string;
  teams: string[];
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  tz: string;
  capacity: number;
}

// 'unknown' = FIFA lists this as an official broadcaster but we haven't confirmed free vs paid yet.
export type ChannelType = 'free-tv' | 'free-stream' | 'radio' | 'paid-tv' | 'paid-stream' | 'unknown';

export interface Channel {
  name: string;
  type: ChannelType;
  languages: string[];
  cost: 'free' | 'paid' | 'unknown';
  url: string;
  source?: string;
  note?: string;
  idChannel?: string; // FIFA channel id — stable key for the classification overlay
  logo?: string;
}

export interface BroadcastMarket {
  country: string;
  channels: Channel[];
}

export type Broadcasts = Record<string, BroadcastMarket>;
