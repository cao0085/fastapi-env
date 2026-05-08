export interface ScoreNote {
  id: number;
  user_id: string;
  score_id: string;
  bar_start: number | null;
  bar_end: number | null;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}
