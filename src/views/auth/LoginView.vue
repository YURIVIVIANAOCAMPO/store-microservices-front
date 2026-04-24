<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import api from '../../api';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, Store, 
  ArrowRight, X, KeyRound, AlertCircle
} from 'lucide-vue-next';

const auth = useAuthStore();
const productStore = useProductStore();
const prefs = usePreferencesStore();
const router = useRouter();

const credentials = reactive({ username: '', password: '' });
const recovery = reactive({ username: '', newPassword: '' });

const showPassword = ref(false);
const loading = ref(false);
const recoveryLoading = ref(false);
const showRecoveryModal = ref(false);
const apiError = ref('');
const recoveryFeedback = ref(null);

const isSuccess = ref(false);

const handleLogin = async () => {
  if (!credentials.username || !credentials.password) {
    apiError.value = 'Complete todos los campos';
    return;
  }

  loading.value = true;
  apiError.value = '';
  try {
    const success = await auth.login(credentials.username, credentials.password);
    if (success) {
      isSuccess.value = true;
      // Senior Plus: Pre-load essential data before entering dashboard
      await productStore.fetchProducts({}, true);
      prefs.showToast(`¡Bienvenido, ${credentials.username}!`, 'success');
      router.push('/');
    } else {
      apiError.value = 'Usuario o clave inválidos';
    }
  } catch (err) {
    apiError.value = err.statusCode === 401 ? 'Credenciales incorrectas' : 'Error de conexión';
  } finally {
    loading.value = false;
  }
};

const handleRecovery = async () => {
  recoveryLoading.value = true;
  recoveryFeedback.value = null;
  try {
    const usersRes = await api.get('/users');
    const user = usersRes.data.data.find(u => u.username === recovery.username);
    if (!user) {
      recoveryFeedback.value = { type: 'error', message: 'No se encontró el usuario' };
      return;
    }
    await api.put(`/users/${user.id}/password`, { newPassword: recovery.newPassword });
    recoveryFeedback.value = { type: 'success', message: 'Clave actualizada' };
    setTimeout(() => { showRecoveryModal.value = false; }, 1500);
  } catch (err) {
    recoveryFeedback.value = { type: 'error', message: 'Error en restablecimiento' };
  } finally {
    recoveryLoading.value = false;
  }
};

const isMounted = ref(false);
onMounted(() => { isMounted.value = true; });
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F9FBFA] p-4 sm:p-8 font-sans overflow-hidden">
    <!-- Allegro Entrance -->
    <transition name="allegro-in">
      <div v-if="isMounted" class="w-full max-w-[380px] sm:max-w-[420px]">
        
        <!-- Branding -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-[24px] shadow-2xl shadow-primary/30 mb-4 transition-transform hover:scale-105">
            <Store class="text-secondary" :size="32" />
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-secondary tracking-tighter mb-1">StoreMaster</h1>
          <p class="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Administración Retail Premium</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <transition name="fade" mode="out-in">
            <div v-if="isSuccess" class="py-10 text-center animate-pulse">
               <Loader2 class="mx-auto text-primary animate-spin mb-4" :size="48" />
               <p class="text-sm font-black text-secondary uppercase tracking-widest">Preparando sistema...</p>
               <p class="text-[10px] text-slate-400 font-bold mt-2">Sincronizando catálogo y stock</p>
            </div>
            <form v-else @submit.prevent="handleLogin" class="space-y-5">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
                <div class="relative">
                  <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="16" />
                  <input 
                    v-model="credentials.username"
                    type="text" 
                    class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:border-primary transition-all text-sm font-bold text-secondary"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between ml-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                  <button type="button" @click="showRecoveryModal = true" class="text-[9px] font-black text-primary hover:underline uppercase tracking-tighter">¿Olvidó su clave?</button>
                </div>
                <div class="relative">
                  <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="16" />
                  <input 
                    v-model="credentials.password"
                    :type="showPassword ? 'text' : 'password'" 
                    class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-11 outline-none focus:bg-white focus:border-primary transition-all text-sm font-bold text-secondary"
                    placeholder="••••••••"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary">
                    <Eye v-if="!showPassword" :size="18" />
                    <EyeOff v-else :size="18" />
                  </button>
                </div>
              </div>

              <div class="min-h-[1.25rem] flex items-center justify-center">
                <transition name="fade">
                  <p v-if="apiError" class="text-[11px] font-bold text-rose-500 tracking-tight flex items-center gap-1">
                    <AlertCircle :size="12" /> {{ apiError }}
                  </p>
                </transition>
              </div>

              <button 
                type="submit" 
                :disabled="loading"
                class="w-full bg-primary hover:bg-primary-hover text-secondary py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Loader2 v-if="loading" class="animate-spin" :size="18" />
                <template v-else>
                  <span>Iniciar Sesión</span>
                  <ArrowRight :size="18" />
                </template>
              </button>
            </form>
          </transition>
        </div>

        <p class="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">StoreMaster &copy; 2026</p>
      </div>
    </transition>

    <!-- Modal Recuperación -->
    <transition name="modal-fade">
      <div v-if="showRecoveryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-secondary/90 backdrop-blur-sm" @click="showRecoveryModal = false"></div>
        <div class="bg-white w-full max-w-sm rounded-[28px] shadow-2xl relative overflow-hidden animate-in zoom-in-95">
          <div class="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 class="text-sm font-black text-secondary uppercase">Recuperar Acceso</h2>
            <button @click="showRecoveryModal = false" class="text-slate-300 hover:text-secondary"><X :size="20" /></button>
          </div>
          <form @submit.prevent="handleRecovery" class="p-8 space-y-4">
            <input v-model="recovery.username" type="text" placeholder="Usuario" class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary" />
            <input v-model="recovery.newPassword" type="password" placeholder="Nueva Clave" class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary" />
            <p v-if="recoveryFeedback" class="text-[10px] font-bold text-center" :class="recoveryFeedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'">{{ recoveryFeedback.message }}</p>
            <button type="submit" :disabled="recoveryLoading" class="w-full bg-secondary text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest">
              {{ recoveryLoading ? 'Procesando...' : 'Actualizar' }}
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.allegro-in-enter-active {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.allegro-in-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
