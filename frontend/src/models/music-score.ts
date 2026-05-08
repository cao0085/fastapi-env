export interface MusicScore {
  id: string;
  title: string;
  composer: string;
  key: string;        // e.g. "Ab maj", "E min"
  time_sig: string;   // e.g. "4/4", "6/4"
  tempo: string;
  tags: string[];
  form: string | null;  // e.g. "AABA"
  created_at: string; // ISO date string
  xml_url: string;    // Cloudflare R2 public URL
  is_verified: boolean;
  is_preview: boolean;
}
