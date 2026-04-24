<script setup>
import { ref, onMounted, watch } from 'vue';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import { Search, Filter, ShoppingCart, ChevronLeft, ChevronRight, RefreshCw, Package } from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const productStore = useProductStore();
const prefs = usePreferencesStore();
const search = ref('');
const statusFilter = ref('');
const page = ref(0);

const fetch = (force = false) => {
  productStore.fetchProducts({
    search: search.value,
    status: statusFilter.value || undefined,
    page: page.value,
    size: 8
  }, force);
};

onMounted(() => fetch());

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
  <div class="space-y-8 animate-in fade-in duration-500">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Catálogo de Productos</h1>
        <p class="text-slate-500 mt-1">Explore y gestione el inventario disponible en tiempo real.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="fetch(true)"
          class="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
          title="Refrescar Catálogo"
        >
          <RefreshCw :size="20" :class="{ 'animate-spin': productStore.loading }" />
        </button>
      </div>
    </header>

    <!-- Filters -->
    <section class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col lg:flex-row gap-4 shadow-sm">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="20" />
        <input 
          v-model="search"
          type="text" 
          placeholder="Buscar por nombre o SKU..." 
          class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white focus:border-primary transition-all"
        />
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative min-w-[200px]">
          <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
          <select 
            v-model="statusFilter"
            class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-8 outline-none focus:bg-white focus:border-primary appearance-none transition-all cursor-pointer"
          >
            <option value="">Todos los Estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
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
        <button @click="fetch(true)" class="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
          Reintentar Conexión
        </button>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in productStore.products" 
          :key="product.id"
          class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col group hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
        >
          <div class="flex justify-between items-start mb-6">
            <span 
              class="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm"
              :class="product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            >
              {{ product.status }}
            </span>
            <p class="text-[10px] text-slate-400 font-mono font-bold">{{ product.sku }}</p>
          </div>
          
          <div class="mb-4 aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 group-hover:text-primary/20 transition-colors">
            <Package :size="64" />
          </div>

          <h3 class="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">{{ product.name }}</h3>
          <p class="text-xs text-slate-400 font-medium mb-6">Consultar stock en detalle</p>

          <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
            <span class="text-xl font-black text-slate-900">{{ prefs.formatPrice(product.price) }}</span>
            <router-link 
              :to="{ name: 'product-detail', params: { id: product.id }}"
              class="flex items-center gap-2 px-4 py-2 bg-primary/10 text-secondary hover:bg-primary rounded-lg font-bold text-sm transition-all active:scale-95 border border-primary/20"
            >
               Detalles
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="productStore.pagination.totalPages > 1" class="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 bg-white p-4 rounded-2xl border border-slate-200">
        <div class="flex items-center gap-2">
          <button 
            @click="changePage(page - 1)"
            :disabled="page === 0"
            class="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft :size="20" />
          </button>
          
          <div class="flex items-center gap-1">
            <button 
              v-for="p in productStore.pagination.totalPages" 
              :key="p"
              @click="changePage(p-1)"
              class="w-10 h-10 rounded-lg text-sm font-bold transition-all"
              :class="page === p-1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'"
            >
              {{ p }}
            </button>
          </div>

          <button 
            @click="changePage(page + 1)"
            :disabled="page === productStore.pagination.totalPages - 1"
            class="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
