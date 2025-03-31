// src/types/index.ts
export interface Player {
    name: string;
    team_id: number;
    team_name: string;
    position: string;
    total_points: number;
    form: number;
    value: number;
    selected_by_percent: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    next_opponent: string | number;
    status?: string;
    chance_of_playing?: number | null;
  }
  
  export interface Injury {
    player: string;
    team: number;
    status: string;
  }
  
  export interface TeamRatingResponse {
    team_rating: number;
  }
  
  