<script setup>
import { ref, onMounted, watch } from 'vue';
import { useProductStore } from '../../stores/products';
import { Search, Filter, ShoppingCart, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const productStore = useProductStore();
const search = ref('');
const statusFilter = ref('');
const page = ref(0);

const fetch = (force = false) => {
  productStore.fetchProducts({
    search: search.value,
    status: statusFilter.value || undefined,
    page: page.value,
    size: 9
  }, force);
};

onMounted(() => fetch());

// Watchers for search and filters
let timeout;
watch([search, statusFilter], () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    page.value = 0;
    fetch();
  }, 500);
});

const changePage = (newPage) => {
  if (newPage >= 0 && newPage < productStore.pagination.totalPages) {
    page.value = newPage;
    fetch();
  }
};
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-500">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black tracking-tight mb-2">Product Catalog</h1>
        <p class="text-slate-400">Manage and explore your store inventory with real-time updates.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="fetch(true)"
          class="p-3 rounded-xl glass hover:bg-white/10 text-slate-400 transition-all"
          title="Refresh Catalog"
        >
          <RefreshCw :size="20" :class="{ 'animate-spin': productStore.loading }" />
        </button>
      </div>
    </header>

    <!-- Search and Filters -->
    <section class="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" :size="20" />
        <input 
          v-model="search"
          type="text" 
          placeholder="Search by name or SKU..." 
          class="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all"
        />
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative">
          <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
          <select 
            v-model="statusFilter"
            class="bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-11 pr-8 outline-none focus:border-primary appearance-none transition-all"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Content -->
    <StatusHandler 
      :loading="productStore.loading" 
      :error="productStore.error" 
      :empty="!productStore.loading && productStore.products.length === 0"
    >
      <template #error-action>
        <button @click="fetch(true)" class="mt-6 px-6 py-2 bg-primary rounded-lg font-bold">Retry Connection</button>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="product in productStore.products" 
          :key="product.id"
          class="glass-card p-6 flex flex-col group"
        >
          <div class="flex justify-between items-start mb-6">
            <span 
              class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider"
              :class="product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'"
            >
              {{ product.status }}
            </span>
            <p class="text-[10px] text-slate-500 font-mono">{{ product.sku }}</p>
          </div>
          
          <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{{ product.name }}</h3>
          <div class="flex items-center gap-2 text-slate-400 text-sm mb-6">
            <span>Inventory available in detail</span>
          </div>

          <div class="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
            <span class="text-2xl font-black text-primary">${{ product.price }}</span>
            <router-link 
              :to="{ name: 'product-detail', params: { id: product.id }}"
              class="p-3 bg-white/5 hover:bg-primary hover:text-white rounded-xl transition-all"
            >
              <ShoppingCart :size="20" />
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="productStore.pagination.totalPages > 1" class="flex items-center justify-center gap-4 mt-12">
        <button 
          @click="changePage(page - 1)"
          :disabled="page === 0"
          class="p-2 glass rounded-lg disabled:opacity-30 transition-all"
        >
          <ChevronLeft />
        </button>
        <span class="text-sm font-medium text-slate-400">
          Page {{ page + 1 }} of {{ productStore.pagination.totalPages }}
        </span>
        <button 
          @click="changePage(page + 1)"
          :disabled="page === productStore.pagination.totalPages - 1"
          class="p-2 glass rounded-lg disabled:opacity-30 transition-all"
        >
          <ChevronRight />
        </button>
      </div>
    </StatusHandler>
  </div>
</template>
