// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPlayers = async () => {
  try {
    const response = await api.get('/players');
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const getInjuries = async () => {
  try {
    const response = await api.get('/injuries');
    return response.data.injuries || [];
  } catch (error) {
    console.error('Error fetching injuries:', error);
    throw error;
  }
};

export const getTransfers = async () => {
  try {
    const response = await api.get('/transfers');
    return response.data;
  } catch (error) {
    console.error('Error fetching transfers:', error);
    throw error;
  }
};

export const getBestXI = async () => {
  try {
    const response = await api.get('/team_builder');
    return response.data.best_xi || [];
  } catch (error) {
    console.error('Error fetching best XI:', error);
    throw error;
  }
};

export const getCaptain = async () => {
  try {
    const response = await api.get('/captain');
    return response.data;
  } catch (error) {
    console.error('Error fetching captain:', error);
    throw error;
  }
};

export const submitTeamRating = async (team) => {
  try {
    const response = await api.post('/team_rating', { team });
    return response.data;
  } catch (error) {
    console.error('Error submitting team rating:', error);
    throw error;
  }
};

export default api;