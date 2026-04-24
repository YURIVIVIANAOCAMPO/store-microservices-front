<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/users';
import { 
  Users as UsersIcon, Shield, Trash2, Calendar, 
  Plus, Edit, Key, MoreHorizontal, X, 
  Search, Filter, Check, AlertCircle, Loader2
} from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const userStore = useUserStore();
const showModal = ref(false);
const editingUser = ref(null);
const showPasswordModal = ref(false);
const loadingAction = ref(false);
const feedback = ref(null);

const form = ref({
  username: '',
  password: '',
  role: 'ROLE_USER'
});

const passwordForm = ref({
  newPassword: ''
});

onMounted(() => userStore.fetchUsers());

const openCreate = () => {
  editingUser.value = null;
  form.value = { username: '', password: '', role: 'ROLE_USER' };
  showModal.value = true;
};

const openEdit = (user) => {
  editingUser.value = user;
  form.value = { username: user.username, role: user.role };
  showModal.value = true;
};

const openPassword = (user) => {
  editingUser.value = user;
  passwordForm.value = { newPassword: '' };
  showPasswordModal.value = true;
};

const handleSubmit = async () => {
  loadingAction.value = true;
  let result;
  if (editingUser.value) {
    result = await userStore.updateUser(editingUser.value.id, {
      username: form.value.username,
      role: form.value.role
    });
  } else {
    result = await userStore.createUser(form.value);
  }

  if (result.success) {
    showModal.value = false;
    feedback.value = { type: 'success', message: `User ${editingUser.value ? 'updated' : 'created'} successfully` };
  } else {
    feedback.value = { type: 'error', message: result.message };
  }
  loadingAction.value = false;
};

const handlePasswordUpdate = async () => {
  loadingAction.value = true;
  const result = await userStore.updatePassword(editingUser.value.id, passwordForm.value.newPassword);
  if (result.success) {
    showPasswordModal.value = false;
    feedback.value = { type: 'success', message: 'Password updated successfully' };
  } else {
    feedback.value = { type: 'error', message: result.message };
  }
  loadingAction.value = false;
};

const deleteUser = async (id) => {
  if (confirm('Are you sure you want to delete this user?')) {
    const result = await userStore.deleteUser(id);
    if (result.success) {
      feedback.value = { type: 'success', message: 'User deleted successfully' };
    } else {
      feedback.value = { type: 'error', message: result.message };
    }
  }
};
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-secondary tracking-tight">Equipo y Colaboradores</h1>
        <p class="text-[13px] text-slate-500 mt-1">Gestione los accesos del personal, roles y políticas de seguridad.</p>
      </div>
      <button 
        @click="openCreate"
        class="bg-primary hover:bg-primary-hover text-secondary px-5 py-2.5 rounded font-bold text-[13px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
      >
        <Plus :size="16" /> Añadir Colaborador
      </button>
    </div>

    <!-- Alert Feedback -->
    <div v-if="feedback" class="animate-in slide-in-from-top-2">
      <div 
        class="p-3 rounded border flex items-center gap-3"
        :class="feedback.type === 'success' ? 'bg-[#E6FCF5] border-[#00ED64]/30 text-[#00684A]' : 'bg-rose-50 border-rose-100 text-rose-700'"
      >
        <Check v-if="feedback.type === 'success'" :size="18" />
        <AlertCircle v-else :size="18" />
        <p class="text-[13px] font-bold">{{ feedback.message }}</p>
        <button @click="feedback = null" class="ml-auto opacity-40 hover:opacity-100"><X :size="14" /></button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white border border-border rounded shadow-sm flex items-center px-4 py-3 gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
        <input 
          type="text" 
          placeholder="Buscar personal..." 
          class="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-10 pr-4 text-[13px] focus:bg-white focus:border-accent outline-none transition-all"
        />
      </div>
      <button class="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-secondary px-3 py-2">
        <Filter :size="14" /> Filtros
      </button>
    </div>

    <!-- Main Table -->
    <StatusHandler :loading="userStore.loading" :empty="userStore.users.length === 0">
      <div class="bg-white border border-border rounded shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th class="px-6 py-4">Colaborador</th>
              <th class="px-6 py-4">Rol en la Tienda</th>
              <th class="px-6 py-4">Fecha de Alta</th>
              <th class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="user in userStore.users" :key="user.id" class="hover:bg-slate-50/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                    <UsersIcon :size="16" />
                  </div>
                  <div>
                    <p class="text-[13px] font-bold text-secondary">{{ user.username }}</p>
                    <p class="text-[10px] font-mono text-slate-400">{{ user.id.split('-')[0] }}...{{ user.id.split('-').pop() }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                  :class="user.role === 'ROLE_ADMIN' ? 'bg-primary/20 text-accent border border-primary/30' : 'bg-slate-100 text-slate-500 border border-slate-200'"
                >
                  {{ user.role.replace('ROLE_', '') }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                  <Calendar :size="14" class="opacity-50" />
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEdit(user)" class="p-1.5 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded" title="Edit Properties">
                    <Edit :size="16" />
                  </button>
                  <button @click="openPassword(user)" class="p-1.5 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded" title="Reset Password">
                    <Key :size="16" />
                  </button>
                  <button @click="deleteUser(user.id)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Delete User">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </StatusHandler>

    <!-- Create/Edit Modal (MongoDB Atlas Style) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-secondary/80 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="bg-white w-full max-w-md rounded shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 class="text-sm font-black uppercase tracking-widest text-secondary">{{ editingUser ? 'Modificar' : 'Añadir' }} Colaborador</h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-secondary"><X :size="20" /></button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="text-[12px] font-bold text-slate-700">Nombre de Usuario</label>
            <input v-model="form.username" type="text" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all" />
          </div>

          <div v-if="!editingUser" class="space-y-1.5">
            <label class="text-[12px] font-bold text-slate-700">Contraseña Temporal</label>
            <input v-model="form.password" type="password" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[12px] font-bold text-slate-700">Rol Operativo</label>
            <select v-model="form.role" class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all appearance-none">
              <option value="ROLE_USER">Usuario Estándar</option>
              <option value="ROLE_ADMIN">Administrador (Acceso Total)</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all border border-border rounded">
              Cancel
            </button>
            <button type="submit" :disabled="loadingAction" class="flex-1 px-4 py-2 bg-secondary text-white text-[13px] font-bold rounded hover:bg-black flex items-center justify-center gap-2">
              <Loader2 v-if="loadingAction" class="animate-spin" :size="16" />
              <span>{{ editingUser ? 'Update User' : 'Create User' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Reset Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-secondary/80 backdrop-blur-sm" @click="showPasswordModal = false"></div>
      <div class="bg-white w-full max-w-sm rounded shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border">
          <h2 class="text-sm font-black uppercase tracking-widest text-secondary">Reset Password</h2>
        </div>
        <form @submit.prevent="handlePasswordUpdate" class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-[12px] font-bold text-slate-700">New Password for {{ editingUser?.username }}</label>
            <input v-model="passwordForm.newPassword" type="password" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all" />
          </div>
          <div class="flex gap-2">
            <button type="button" @click="showPasswordModal = false" class="flex-1 py-2 text-xs font-bold border rounded">Cancel</button>
            <button type="submit" :disabled="loadingAction" class="flex-1 py-2 bg-secondary text-white text-xs font-bold rounded">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
