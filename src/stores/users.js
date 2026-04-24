import { defineStore } from 'pinia';
import api from '../api';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const res = await api.get('/users');
        this.users = res.data.data;
      } catch (err) {
        this.error = err.friendlyMessage;
      } finally {
        this.loading = false;
      }
    },

    async createUser(userData) {
      try {
        await api.post('/auth/register', userData); // Assuming registration endpoint creates users
        await this.fetchUsers();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      }
    },

    async updateUser(id, userData) {
      try {
        await api.put(`/users/${id}`, userData);
        await this.fetchUsers();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      }
    },

    async updatePassword(id, newPassword) {
      try {
        await api.put(`/users/${id}/password`, { newPassword });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      }
    },

    async deleteUser(id) {
      try {
        await api.delete(`/users/${id}`);
        await this.fetchUsers();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.friendlyMessage };
      }
    }
  }
});
