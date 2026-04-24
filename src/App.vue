<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { 
  LayoutDashboard, ShoppingBag, Users, Settings, 
  LogOut, Menu, X, Bell, User as UserIcon, ShieldCheck
} from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const isMobileMenuOpen = ref(false);

const navItems = computed(() => {
  const items = [
    { name: 'Catálogo', path: '/', icon: ShoppingBag, admin: false },
  ];
  
  if (auth.user?.role === 'ROLE_ADMIN') {
    items.push({ name: 'Gestión', path: '/management', icon: LayoutDashboard, admin: true });
    items.push({ name: 'Usuarios', path: '/users', icon: Users, admin: true });
  }
  
  return items;
});

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <div v-if="auth.isAuthenticated" class="min-h-screen bg-background flex flex-col lg:flex-row">
    <!-- Mobile Header -->
    <header class="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <LayoutDashboard :size="20" />
        </div>
        <span class="font-bold text-slate-900 tracking-tight">StoreAdmin</span>
      </div>
      <button @click="isMobileMenuOpen = true" class="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
        <Menu :size="24" />
      </button>
    </header>

    <!-- Sidebar / Drawer -->
    <aside 
      class="fixed inset-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 lg:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Backdrop -->
      <div v-if="isMobileMenuOpen" @click="closeMobileMenu" class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden"></div>
      
      <div class="relative w-[280px] h-full bg-white border-r border-slate-200 flex flex-col shadow-2xl lg:shadow-none">
        <!-- Sidebar Header -->
        <div class="px-8 py-8 hidden lg:flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <LayoutDashboard :size="24" />
          </div>
          <span class="text-xl font-bold text-slate-900 tracking-tighter">StoreAdmin</span>
        </div>

        <div class="lg:hidden px-6 py-6 flex items-center justify-between border-b border-slate-50">
           <span class="font-bold text-slate-900">Menú</span>
           <button @click="closeMobileMenu" class="p-2 text-slate-400"><X :size="20" /></button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            @click="closeMobileMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group"
            :class="route.path === item.path ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
          >
            <component :is="item.icon" :size="20" :class="route.path === item.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'" />
            {{ item.name }}
            <ShieldCheck v-if="item.admin" :size="14" class="ml-auto opacity-40" />
          </router-link>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center gap-3 p-3 mb-4 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <UserIcon :size="20" />
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-bold text-slate-900 truncate">{{ auth.user?.username }}</p>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{{ auth.user?.role.replace('ROLE_', '') }}</p>
            </div>
          </div>
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut :size="20" /> Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
      <!-- Top Navbar -->
      <header class="hidden lg:flex h-20 bg-white border-b border-slate-200 px-10 items-center justify-between sticky top-0 z-30">
        <h2 class="text-xl font-bold text-slate-900">{{ route.name === 'products' ? 'Dashboard' : route.name?.charAt(0).toUpperCase() + route.name?.slice(1) }}</h2>
        <div class="flex items-center gap-6">
          <button class="p-2 text-slate-400 hover:text-slate-600 relative">
            <Bell :size="20" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <div class="h-8 w-[1px] bg-slate-200"></div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-xs font-bold text-slate-900">{{ auth.user?.username }}</p>
              <p class="text-[10px] text-slate-500 uppercase tracking-widest">{{ auth.user?.role }}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <UserIcon :size="20" />
            </div>
          </div>
        </div>
      </header>

      <!-- View Content -->
      <div class="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  
  <div v-else>
    <router-view />
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
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
