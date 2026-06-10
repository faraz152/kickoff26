import type { MetadataRoute } from 'next';
import { getTeams, getMatches, getVenues } from '@kickoff26/data';
import { SITE_URL } from '@kickoff26/core';

export const dynamic = 'force-static';

// Every page, so search engines can find the per-team / per-match / per-venue routes. URLs carry the
// trailing slash to match next.config's trailingSlash (the canonical form).
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;

  const top: MetadataRoute.Sitemap = [
    { url: url('/'), priority: 1 },
    { url: url('/schedule/'), priority: 0.9 },
    { url: url('/bracket/'), priority: 0.8 },
    { url: url('/groups/'), priority: 0.8 },
    { url: url('/watch/'), priority: 0.8 },
    { url: url('/my-team/'), priority: 0.7 },
    { url: url('/venue/'), priority: 0.6 },
  ];

  const teams = getTeams().map((t) => ({ url: url(`/team/${t.id}/`), priority: 0.5 }));
  const matches = getMatches().map((m) => ({ url: url(`/match/${m.id}/`), priority: 0.5 }));
  const venues = getVenues().map((v) => ({ url: url(`/venue/${v.id}/`), priority: 0.4 }));

  return [...top, ...teams, ...matches, ...venues];
}
