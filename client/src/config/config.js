import axios from 'axios';

const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

export default instance;
