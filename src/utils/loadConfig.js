import axios from 'axios';

export const loadConfig = async () => {
  const response = await axios.get('/globalConfig.json');
  return response.data;
};
