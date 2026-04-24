<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Loader2, Mail, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();

const username = ref('admin');
const password = ref('admin');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const success = await auth.login(username.value, password.value);
    if (success) {
      router.push('/');
    } else {
      error.value = 'Credenciales inválidas. Por favor intente de nuevo.';
    }
  } catch (err) {
    error.value = err.friendlyMessage || 'Ocurrió un error inesperado';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-6">
    <div class="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-4">
          <LayoutDashboard class="text-white" :size="32" />
        </div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h1>
        <p class="text-slate-500 mt-2">Gestione su inventario de manera eficiente</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
        <div class="p-8 md:p-10">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Username Input -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-700 ml-1">Usuario</label>
              <div class="relative group">
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" :size="20" />
                <input 
                  v-model="username"
                  type="text" 
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <div class="flex items-center justify-between ml-1">
                <label class="text-sm font-semibold text-slate-700">Contraseña</label>
                <a href="#" class="text-xs font-bold text-primary hover:underline">¿Olvidó su contraseña?</a>
              </div>
              <div class="relative group">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" :size="20" />
                <input 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Eye v-if="!showPassword" :size="20" />
                  <EyeOff v-else :size="20" />
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium animate-in slide-in-from-top-2">
              {{ error }}
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <span v-else>Iniciar Sesión</span>
            </button>
          </form>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">
            ¿No tiene una cuenta? 
            <a href="#" class="text-primary font-bold hover:underline">Solicitar acceso</a>
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <p class="text-center text-slate-400 text-xs mt-8">
        &copy; 2026 Store Microservices. Todos los derechos reservados.
      </p>
    </div>
  </div>
</template>
