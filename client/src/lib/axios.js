import axios from 'axios';

// Initialize axios defaults
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

axios.defaults.headers.common['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
axios.defaults.headers.common['Pragma'] = 'no-cache';
axios.defaults.withCredentials = true;

export default axios;