<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  LogOut, 
  ShoppingBag,
  User as UserIcon,
  ShieldCheck
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

const navItems = [
  { name: 'Products', path: '/', icon: Package },
];

if (auth.isAdmin) {
  navItems.push({ name: 'Users', path: '/users', icon: Users });
}
</script>

<template>
  <div v-if="route.name !== 'login'" class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 glass border-r border-white/5 flex flex-col p-6 fixed inset-y-0 left-0 z-50">
      <div class="flex items-center gap-3 mb-10">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <ShoppingBag :size="24" />
        </div>
        <h2 class="text-2xl font-bold font-display tracking-tight">StoreVue</h2>
      </div>

      <nav class="flex-1 space-y-2">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          class="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
          :class="route.path === item.path ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'"
        >
          <component :is="item.icon" :size="20" />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="mt-auto pt-6 border-t border-white/5">
        <div class="flex items-center gap-3 mb-6 px-2">
          <div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
            <UserIcon :size="18" />
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-bold truncate">{{ auth.user?.username }}</p>
            <p class="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck :size="10" /> {{ auth.user?.role?.replace('ROLE_', '') }}
            </p>
          </div>
        </div>
        
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 p-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut :size="20" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64 p-10 relative overflow-x-hidden">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>

  <div v-else>
    <router-view />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
