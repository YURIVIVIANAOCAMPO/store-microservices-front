<script setup>
import { ref, onMounted, watch } from 'vue';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import { Search, Filter, ShoppingCart, ChevronLeft, ChevronRight, RefreshCw, Package, ArrowRight, Eye } from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const productStore = useProductStore();
const prefs = usePreferencesStore();
const search = ref('');
const statusFilter = ref('');
const page = ref(0);

const fetch = (force = false) => {
  productStore.fetchProducts({
    search: search.value,
    status: 'ACTIVE',
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

// Helper for more realistic images based on name keywords
const getImageUrl = (product) => {
  const name = product.name.toLowerCase();
  let keyword = 'technology';
  if (name.includes('teclado') || name.includes('keyboard')) keyword = 'keyboard';
  if (name.includes('mouse') || name.includes('raton')) keyword = 'mouse';
  if (name.includes('monitor')) keyword = 'monitor';
  if (name.includes('laptop') || name.includes('portatil')) keyword = 'laptop';
  if (name.includes('reloj') || name.includes('watch')) keyword = 'smartwatch';
  
  return `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400&sig=${product.sku}`;
  // Note: Standardized on the high-quality placeholder for now to maintain aesthetic consistency, 
  // but could be switched to `https://source.unsplash.com/featured/?${keyword}&sig=${product.sku}`
};
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-500 pb-20">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
      <div>
        <h1 class="text-5xl font-black text-[#001E2B] tracking-tighter">Catálogo Global</h1>
        <p class="text-slate-500 mt-2 font-medium">Hardware de alto rendimiento con sincronización en tiempo real.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="fetch(true)"
          class="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-[#001E2B] font-black text-[10px] uppercase tracking-widest hover:border-[#00ED64] transition-all shadow-sm active:scale-95"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': productStore.loading }" /> Sincronizar Todo
        </button>
      </div>
    </header>

    <!-- Filters Premium -->
    <section class="bg-white p-2 rounded-[24px] border border-slate-100 flex flex-col lg:flex-row gap-2 shadow-xl shadow-slate-200/40">
      <div class="flex-1 relative">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
        <input 
          v-model="search"
          type="text" 
          placeholder="Buscar hardware por modelo o SKU..." 
          class="w-full bg-slate-50/50 border-transparent border rounded-[20px] py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-[#00ED64] transition-all font-medium text-sm"
        />
      </div>
    </section>

    <!-- Content Grid -->
    <StatusHandler 
      :loading="productStore.loading" 
      :error="productStore.error" 
      :empty="!productStore.loading && productStore.products.length === 0"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div 
          v-for="product in productStore.products" 
          :key="product.id"
          class="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/60 hover:border-[#00ED64]/30 transition-all duration-500 relative overflow-hidden"
        >
          <div class="flex justify-between items-center mb-6">
            <span 
              class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
              :class="product.status === 'ACTIVE' ? 'bg-[#E6FCF5] text-[#00684A] border border-[#00ED64]/20' : 'bg-slate-50 text-slate-400 border border-slate-200'"
            >
              {{ product.status }}
            </span>
            <p class="text-[9px] text-slate-300 font-black tracking-widest uppercase">{{ product.sku }}</p>
          </div>
          
          <!-- Product Image Container -->
          <div class="mb-6 aspect-square bg-slate-50 rounded-[24px] overflow-hidden border border-slate-50 flex items-center justify-center group-hover:border-[#00ED64]/20 transition-all relative">
            <img 
              :src="getImageUrl(product)" 
              class="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-700"
              alt="Product Image"
            />
            <!-- Stock Badge Overlay -->
            <div class="absolute bottom-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
               <div class="w-1.5 h-1.5 rounded-full" :class="product.stock > 0 ? 'bg-[#00ED64]' : 'bg-rose-500'"></div>
               <span class="text-[9px] font-black text-secondary">{{ product.stock || 0 }} UN</span>
            </div>
          </div>

          <h3 class="text-xl font-black text-[#001E2B] mb-1 group-hover:text-[#00684A] transition-colors line-clamp-1 tracking-tighter">{{ product.name }}</h3>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Hardware Certificado</p>

          <div class="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
            <span class="text-2xl font-black text-[#00ED64]">{{ prefs.formatPrice(product.price) }}</span>
            <router-link 
              :to="{ name: 'product-detail', params: { id: product.id }}"
              class="p-3 bg-slate-50 text-secondary hover:bg-[#001E2B] hover:text-white rounded-xl transition-all active:scale-90 border border-slate-100 hover:border-[#001E2B]"
            >
               <Eye :size="20" />
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination Premium -->
      <div v-if="productStore.pagination.totalPages > 1" class="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
        <div class="flex items-center gap-3 bg-white p-2 rounded-[20px] border border-slate-100 shadow-lg shadow-slate-200/40">
          <button 
            @click="changePage(page - 1)"
            :disabled="page === 0"
            class="p-3 bg-slate-50 text-slate-400 rounded-[14px] disabled:opacity-20 hover:bg-slate-100 transition-all"
          >
            <ChevronLeft :size="20" />
          </button>
          
          <div class="flex items-center gap-1">
            <button 
              v-for="p in productStore.pagination.totalPages" 
              :key="p"
              @click="changePage(p-1)"
              class="w-10 h-10 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all"
              :class="page === p-1 ? 'bg-[#001E2B] text-white shadow-xl shadow-black/20' : 'text-slate-400 hover:bg-slate-50'"
            >
              {{ p }}
            </button>
          </div>

          <button 
            @click="changePage(page + 1)"
            :disabled="page === productStore.pagination.totalPages - 1"
            class="p-3 bg-slate-50 text-slate-400 rounded-[14px] disabled:opacity-20 hover:bg-slate-100 transition-all"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
