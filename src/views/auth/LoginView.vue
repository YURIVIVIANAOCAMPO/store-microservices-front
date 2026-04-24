<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    await auth.login(username.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.friendlyMessage || 'Invalid credentials';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
    <!-- Glow effects -->
    <div class="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"></div>
    <div class="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full"></div>

    <div class="w-full max-w-md z-10">
      <div class="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-primary/40">
          <ShoppingBag :size="32" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
        <p class="text-slate-400">Sign in to manage your store inventory</p>
      </div>

      <div class="glass p-8 rounded-3xl shadow-2xl border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Username</label>
            <input 
              v-model="username"
              type="text" 
              placeholder="admin"
              class="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input 
              v-model="password"
              type="password" 
              placeholder="••••••••"
              class="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              required
            />
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm text-center">
            {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <template v-else>
              Sign In <ArrowRight :size="18" />
            </template>
          </button>
        </form>

        <p class="text-center mt-8 text-sm text-slate-500">
          Don't have an account? 
          <a href="#" class="text-primary font-bold hover:underline">Request access</a>
        </p>
      </div>
    </div>
  </div>
</template>
