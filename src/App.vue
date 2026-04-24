<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { usePreferencesStore } from './stores/preferences';
import { 
  Store, ShoppingBag, Users, Settings, 
  LogOut, Menu, X, Bell, User as UserIcon, ShieldCheck, 
  ChevronRight, Box, Package, ChevronLeft, Globe, CheckCircle, AlertTriangle
} from 'lucide-vue-next';

const auth = useAuthStore();
const prefs = usePreferencesStore();
const router = useRouter();
const route = useRoute();
const isMobileMenuOpen = ref(false);

const navItems = computed(() => {
  const items = [
    { name: 'Catálogo Browser', path: '/', icon: ShoppingBag, admin: false },
  ];
  
  if (auth.user?.role === 'ROLE_ADMIN') {
    items.push({ name: 'Gestión de Inventario', path: '/management', icon: Package, admin: true });
    items.push({ name: 'Equipo y Accesos', path: '/users', icon: Users, admin: true });
  }
  
  return items;
});

const handleLogout = () => {
  const username = auth.user?.username;
  auth.logout();
  prefs.showToast(`Adiós ${username}, te esperamos pronto.`, 'info');
  router.push('/login');
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const currencies = ['USD', 'COP', 'MXN'];
</script>

<template>
  <div v-if="auth.isAuthenticated && route.path !== '/login'" class="min-h-screen bg-[#F9FBFA] flex flex-col lg:flex-row">
    <!-- Mobile Header -->
    <header class="lg:hidden bg-[#001E2B] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-[#00ED64] rounded flex items-center justify-center text-[#001E2B]">
          <Store :size="20" />
        </div>
        <span class="font-bold text-white tracking-tight">StoreMaster</span>
      </div>
      <button @click="isMobileMenuOpen = true" class="p-2 text-white/70 hover:text-white">
        <Menu :size="24" />
      </button>
    </header>

    <!-- Sidebar  -->
    <aside 
      class="fixed inset-0 z-50 lg:relative lg:z-0 transform transition-all duration-300 ease-in-out"
      :class="[
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        prefs.isSidebarCollapsed ? 'lg:w-[70px]' : 'lg:w-[260px]'
      ]"
    >
      <!-- Mobile Backdrop -->
      <div v-if="isMobileMenuOpen" @click="closeMobileMenu" class="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden"></div>
      
      <div class="relative h-full bg-[#001E2B] flex flex-col border-r border-white/5 shadow-2xl lg:shadow-none min-h-screen">
        <!-- Toggle Button (Desktop) -->
        <button 
          @click="prefs.toggleSidebar"
          class="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-[#00ED64] text-[#001E2B] rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        >
          <ChevronLeft v-if="!prefs.isSidebarCollapsed" :size="14" />
          <ChevronRight v-else :size="14" />
        </button>

        <!-- Sidebar Brand -->
        <div class="px-6 py-8 flex items-center gap-3 shrink-0">
          <div class="w-8 h-8 bg-[#00ED64] rounded flex items-center justify-center text-[#001E2B] shadow-[0_0_15px_rgba(0,237,100,0.3)] shrink-0">
            <Store :size="20" />
          </div>
          <div v-if="!prefs.isSidebarCollapsed" class="overflow-hidden whitespace-nowrap animate-in fade-in slide-in-from-left-2">
            <span class="text-lg font-bold text-white tracking-tight leading-none block">StoreMaster</span>
            <span class="text-[9px] text-[#00ED64] font-black uppercase tracking-widest">Enterprise Retail</span>
          </div>
        </div>

        <!-- Navigation Section -->
        <div class="px-3 py-2 flex-1">
          <p v-if="!prefs.isSidebarCollapsed" class="px-3 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 whitespace-nowrap">Operaciones</p>
          <nav class="space-y-1">
            <router-link 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              @click="closeMobileMenu"
              class="flex items-center gap-3 px-3 py-2.5 rounded transition-all group relative"
              :class="route.path === item.path ? 'bg-[#00684A] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'"
            >
              <div v-if="route.path === item.path" class="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00ED64] rounded-r"></div>
              <component :is="item.icon" :size="20" :class="route.path === item.path ? 'text-[#00ED64]' : 'text-white/40 group-hover:text-white/60'" class="shrink-0" />
              <span v-if="!prefs.isSidebarCollapsed" class="text-[13px] font-medium whitespace-nowrap">{{ item.name }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Footer / Disconnect -->
        <div class="shrink-0 border-t border-white/5 bg-black/20 p-4">
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut :size="16" class="shrink-0" /> 
            <span v-if="!prefs.isSidebarCollapsed">Salir del Sistema</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-[#E8EDEB] flex items-center justify-between px-8 shrink-0 z-30 sticky top-0">
        <!-- Left Side: Breadcrumb -->
        <div class="flex items-center gap-2 text-[12px] font-medium text-slate-500">
          <span class="hover:text-secondary cursor-pointer">Admin</span>
          <ChevronRight :size="14" />
          <span class="text-secondary font-bold">{{ route.name?.charAt(0).toUpperCase() + route.name?.slice(1) }}</span>
        </div>

        <!-- Center Side: Currency Switcher -->
        <div class="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
          <button 
            v-for="curr in currencies" 
            :key="curr"
            @click="prefs.setCurrency(curr)"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
            :class="prefs.currency === curr ? 'bg-[#001E2B] text-white shadow-md' : 'text-slate-400 hover:text-secondary hover:bg-white'"
          >
            {{ curr }}
          </button>
        </div>

        <!-- Right Side: User Identity & Actions -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3 pl-6 border-l border-slate-100">
             <div class="text-right hidden sm:block">
                <p class="text-[12px] font-bold text-secondary leading-none mb-1">{{ auth.user?.username }}</p>
                <div class="flex items-center justify-end gap-1">
                   <div class="w-1.5 h-1.5 rounded-full bg-[#00ED64]"></div>
                   <p class="text-[9px] text-slate-400 uppercase font-black tracking-widest">{{ auth.user?.role.replace('ROLE_', '') }}</p>
                </div>
             </div>
             <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-inner group cursor-pointer hover:border-[#00ED64]/50 transition-all">
                <UserIcon :size="18" class="group-hover:text-[#00ED64] transition-colors" />
             </div>
          </div>
          
          <button class="text-slate-400 hover:text-secondary transition-colors relative">
            <Bell :size="20" />
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <!-- Dashboard Viewport -->
      <div class="flex-1 px-8 py-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  
  <div v-else class="min-h-screen">
    <router-view />
  </div>

  <!-- Global Toast -->
  <transition name="toast">
    <div v-if="prefs.toast?.show" class="fixed bottom-10 right-10 z-[1000]">
      <div 
        class="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border"
        :class="[
          prefs.toast?.type === 'success' ? 'bg-[#001E2B] text-[#00ED64] border-[#00ED64]/20' : 
          prefs.toast?.type === 'error' ? 'bg-rose-900 text-white border-rose-500/30' : 
          'bg-slate-900 text-white border-slate-700'
        ]"
      >
        <CheckCircle v-if="prefs.toast?.type === 'success'" :size="24" />
        <AlertTriangle v-else :size="24" />
        <div class="pr-8">
           <p class="text-xs font-black uppercase tracking-widest opacity-50 mb-0.5">Notificación</p>
           <p class="text-sm font-bold">{{ prefs.toast?.message }}</p>
        </div>
        <button @click="prefs.toast.show = false" class="absolute top-4 right-4 opacity-50 hover:opacity-100">
           <X :size="16" />
        </button>
      </div>
    </div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100px) scale(0.9); }
</style>
