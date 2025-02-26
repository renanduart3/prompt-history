
import axios from 'axios';

// TODO: Replace with your Heroku FastAPI URL
const BASE_URL = 'https://your-heroku-app.herokuapp.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processText = async (text: string) => {
  try {
    const response = await api.post('/process-text', { text });
    return response.data;
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
};
