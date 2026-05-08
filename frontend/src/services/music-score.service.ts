import type { MusicScore } from '../models/music-score';

const BASE_URL = import.meta.env.VITE_R2_BASE_URL as string;

export async function fetchScores(): Promise<MusicScore[]> {
  const res = await fetch(`${BASE_URL}/jazz-standard-xml/source.json`);
  if (!res.ok) throw new Error(`Failed to fetch scores: ${res.status}`);
  return res.json();
}

export async function fetchXml(xmlUrl: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/${xmlUrl}`);
  if (!res.ok) throw new Error(`Failed to fetch xml: ${res.status}`);
  return res.text();
}
