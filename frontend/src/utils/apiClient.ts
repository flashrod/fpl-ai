// src/utils/apiClient.ts
import axios from 'axios';
import { Player, Injury, TeamRatingResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchPlayers = async (): Promise<Player[]> => {
  const response = await apiClient.get<Player[]>('/players');
  return response.data;
};

export const fetchInjuries = async (): Promise<{ injuries: Injury[] }> => {
  const response = await apiClient.get<{ injuries: Injury[] }>('/injuries');
  return response.data;
};

export const fetchTransfers = async (): Promise<Player[]> => {
  const response = await apiClient.get<Player[]>('/transfers');
  return response.data;
};

export const fetchBestXI = async (): Promise<{ best_xi: Player[] }> => {
  const response = await apiClient.get<{ best_xi: Player[] }>('/team_builder');
  return response.data;
};

export const fetchCaptain = async (): Promise<Player> => {
  const response = await apiClient.get<Player>('/captain');
  return response.data;
};

export const submitTeamRating = async (team: string[]): Promise<TeamRatingResponse> => {
  const response = await apiClient.post<TeamRatingResponse>('/team_rating', { team });
  return response.data;
};

export default apiClient;