import { defineStore } from 'pinia';
import api from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ROLE_ADMIN',
  },

  actions: {
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/login', { username, password });
        const { token } = res.data.data;
        this.token = token;
        localStorage.setItem('token', token);
        
        // Fetch user info
        const usersRes = await api.get('/users');
        const user = usersRes.data.data.find(u => u.username === username) || { username, role: 'ROLE_USER' };
        
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      } catch (err) {
        this.error = err.friendlyMessage || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(username, password) {
      this.loading = true;
      this.error = null;
      try {
        await api.post('/auth/register', { username, password });
        return true;
      } catch (err) {
        this.error = err.friendlyMessage || 'Registration failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
