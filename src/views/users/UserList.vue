<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../stores/users';
import { usePreferencesStore } from '../../stores/preferences';
import { 
  Plus, Search, Edit2, Trash2, User, 
  Filter, X, Loader2, Shield, Key
} from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const userStore = useUserStore();
const prefs = usePreferencesStore();
const showModal = ref(false);
const editingUser = ref(null);
const loadingAction = ref(false);

const form = ref({
  username: '',
  password: '',
  role: 'ROLE_USER'
});

const fetchUsers = () => userStore.fetchUsers();

onMounted(() => fetchUsers());

const openCreate = () => {
  editingUser.value = null;
  form.value = { username: '', password: '', role: 'ROLE_USER' };
  showModal.value = true;
};

const openEdit = (user) => {
  editingUser.value = user;
  form.value = { username: user.username, role: user.role, password: '' };
  showModal.value = true;
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
    fetchUsers();
    form.value = { username: '', password: '', role: 'ROLE_USER' };
    prefs.showToast(`Colaborador ${editingUser.value ? 'actualizado' : 'añadido'} correctamente`, 'success');
  } else {
    prefs.showToast(result.message, 'error');
  }
  loadingAction.value = false;
};

const confirmDelete = async (id) => {
  if (confirm('¿Desea eliminar este colaborador?')) {
    loadingAction.value = true;
    const result = await userStore.deleteUser(id);
    if (result.success) {
      fetchUsers();
      prefs.showToast('Colaborador eliminado del sistema', 'success');
    } else {
      prefs.showToast(result.message, 'error');
    }
    loadingAction.value = false;
  }
};

const handleResetPassword = async (user) => {
  const newPassword = prompt(`Ingrese la nueva contraseña para ${user.username}:`, 'admin');
  if (newPassword) {
    loadingAction.value = true;
    const result = await userStore.updatePassword(user.id, newPassword);
    if (result.success) {
      prefs.showToast('Contraseña actualizada con éxito', 'success');
    } else {
      prefs.showToast(result.message, 'error');
    }
    loadingAction.value = false;
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

    <!-- Table -->
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
                  <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:text-primary transition-all">
                    <User :size="16" />
                  </div>
                  <div>
                    <p class="text-[13px] font-bold text-secondary">{{ user.username }}</p>
                    <p class="text-[10px] font-bold text-slate-400">{{ user.id.split('-')[0] }}...{{ user.id.split('-').pop() }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <Shield :size="14" class="text-slate-300" />
                  <span class="text-[11px] font-bold text-slate-600">{{ user.role.replace('ROLE_', '') }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-[11px] text-slate-400">{{ new Date().toLocaleDateString() }}</p>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="handleResetPassword(user)" class="p-1.5 text-slate-300 hover:text-primary hover:bg-primary/10 rounded" title="Restablecer Clave">
                    <Key :size="16" />
                  </button>
                  <button @click="openEdit(user)" class="p-1.5 text-slate-300 hover:text-secondary hover:bg-slate-100 rounded" title="Editar Perfil">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="confirmDelete(user.id)" class="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded" title="Eliminar Acceso">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </StatusHandler>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-secondary/80 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="bg-white w-full max-w-md rounded shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 class="text-sm font-black uppercase tracking-widest text-secondary">{{ editingUser ? 'Modificar' : 'Añadir' }} Colaborador</h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-secondary"><X :size="20" /></button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Nombre de Usuario</label>
            <input v-model="form.username" type="text" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[12px] outline-none focus:border-accent transition-all" />
          </div>

          <div v-if="!editingUser" class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Contraseña Temporal</label>
            <input v-model="form.password" type="password" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[12px] outline-none focus:border-accent transition-all" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Rol Operativo</label>
            <select v-model="form.role" class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[12px] outline-none focus:border-accent transition-all appearance-none">
              <option value="ROLE_USER">Usuario Estándar</option>
              <option value="ROLE_ADMIN">Administrador (Acceso Total)</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all border border-border rounded uppercase">
              Cancelar
            </button>
            <button type="submit" :disabled="loadingAction" class="flex-1 px-4 py-2 bg-secondary text-white text-[11px] font-bold rounded hover:bg-black flex items-center justify-center gap-2 uppercase">
              <Loader2 v-if="loadingAction" class="animate-spin" :size="16" />
              <span>{{ editingUser ? 'Actualizar' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
