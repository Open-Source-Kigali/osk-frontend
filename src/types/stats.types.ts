// Community stats returned by GET /stats — the API shape and the UI shape are
// identical, so no transform is needed.
export interface Stats {
  contributors: number;
  members:      number;
  projects:     number;
  events:       number;
  partners:     number;
  reviews:      number;
  pullRequests: number;
}

export type StatKey = keyof Stats;

// A stat as displayed on a page: which live value to show, its label, and
// optional sub-text. The number itself comes from the API.
export interface StatDisplay {
  key:   StatKey;
  label: string;
  sub?:  string;
}
