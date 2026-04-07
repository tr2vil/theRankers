export interface Analyst {
  id: number;
  name: string;
  firm: string;
  sector: string | null;
  image_url: string | null;
  total_reports: number;
  accuracy_rate: number;
  avg_return: number;
  ranking_score: number;
  created_at: string;
}

export interface Report {
  id: number;
  analyst_id: number;
  stock_id: number;
  title: string | null;
  opinion: "매수" | "중립" | "매도";
  target_price: number;
  previous_target_price: number | null;
  report_date: string;
  price_at_report: number | null;
  target_achieved: boolean | null;
  excess_return_3m: number | null;
  analyst_name: string | null;
  analyst_firm: string | null;
  stock_name: string | null;
  stock_code: string | null;
  created_at: string;
}

export interface Stock {
  id: number;
  code: string;
  name: string;
  market: string;
  gics_sector: string | null;
  gics_sector_code: string | null;
  created_at: string;
}

export interface RankingEntry {
  rank: number;
  analyst_id: number;
  analyst_name: string;
  analyst_firm: string;
  analyst_image_url: string | null;
  score: number;
  target_hit_score: number;
  excess_return_score: number;
  direction_accuracy_score: number;
  consistency_score: number;
  total_reports: number;
  accuracy_rate: number;
}

export interface Post {
  id: number;
  board_id: number;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  author_username: string;
  author_display_name: string | null;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  like_count: number;
  author_username: string;
  author_display_name: string | null;
  parent_id: number | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ReportDetail extends Report {
  price_1m: number | null;
  price_3m: number | null;
  price_6m: number | null;
  price_12m: number | null;
  excess_return_1m: number | null;
  excess_return_6m: number | null;
  excess_return_12m: number | null;
  achieved_date: string | null;
  source_url: string | null;
}

export interface StockConsensus {
  stock: Stock;
  buy_count: number;
  hold_count: number;
  sell_count: number;
  avg_target_price: number;
  high_target_price: number | null;
  low_target_price: number | null;
  current_price: number | null;
  report_count: number;
}

export interface RankingResponse {
  period: string;
  calculated_at: string | null;
  items: RankingEntry[];
  total: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  is_active: boolean;
}
