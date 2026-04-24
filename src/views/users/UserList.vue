<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';
import { Users as UsersIcon, Shield, Trash2, Calendar, Loader2 } from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get('/users');
    users.value = res.data.data;
  } catch (err) {
    error.value = err.friendlyMessage || 'Failed to load users';
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchUsers());

const deleteUser = async (id) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.friendlyMessage || 'Delete failed');
    }
  }
};
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-500">
    <header>
      <h1 class="text-4xl font-black tracking-tight mb-2">User Administration</h1>
      <p class="text-slate-400">Manage platform access, roles and security policies.</p>
    </header>

    <StatusHandler :loading="loading" :error="error" :empty="users.length === 0">
      <div class="glass rounded-3xl overflow-hidden border-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white/5 border-bottom border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <th class="px-8 py-5">User Identity</th>
                <th class="px-8 py-5">Role / Status</th>
                <th class="px-8 py-5">Access Level</th>
                <th class="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="user in users" :key="user.id" class="hover:bg-white/5 transition-colors">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                      <UsersIcon :size="20" class="text-slate-400" />
                    </div>
                    <div>
                      <p class="font-bold text-white">{{ user.username }}</p>
                      <p class="text-xs text-slate-500 font-mono">{{ user.id.split('-')[0] }}...{{ user.id.split('-').pop() }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    :class="user.role === 'ROLE_ADMIN' ? 'bg-accent/20 text-accent' : 'bg-slate-800 text-slate-400'"
                  >
                    {{ user.role.replace('ROLE_', '') }}
                  </span>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar :size="14" />
                    Joined {{ new Date(user.createdAt).toLocaleDateString() }}
                  </div>
                </td>
                <td class="px-8 py-6 text-right">
                  <button 
                    @click="deleteUser(user.id)"
                    class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
