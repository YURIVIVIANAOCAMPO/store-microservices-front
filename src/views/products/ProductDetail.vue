<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import { ChevronLeft, Package, ShoppingCart, Loader2, AlertTriangle, CheckCircle2, Box, Info, ShieldCheck, Activity } from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const prefs = usePreferencesStore();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const purchaseLoading = ref(false);
const purchaseFeedback = ref(null);

// Prioritize stock from the product object, then fallback to global store
const stock = computed(() => {
  if (product.value && product.value.stock !== undefined) return product.value.stock;
  return productStore.inventory[route.params.id] || 0;
});

const fetchDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get(`/products/${route.params.id}`);
    product.value = res.data.data;
    // Also update the global store for consistency
    await productStore.fetchStock(route.params.id);
  } catch (err) {
    error.value = err.friendlyMessage || 'Error al cargar detalles';
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchDetail());

const handlePurchase = async () => {
  if (quantity.value > stock.value) {
    purchaseFeedback.value = { type: 'error', message: 'No hay suficiente stock disponible' };
    return;
  }

  purchaseLoading.value = true;
  purchaseFeedback.value = null;
  
  const result = await productStore.purchaseProduct(product.value.id, quantity.value);
  
  if (result.success) {
    purchaseFeedback.value = { type: 'success', message: '¡Compra realizada con éxito!' };
    // Refresh local stock after purchase
    await fetchDetail();
  } else {
    purchaseFeedback.value = { type: 'error', message: result.message };
  }
  
  purchaseLoading.value = false;
};
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
    <div class="flex items-center justify-between">
      <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-secondary transition-all font-bold text-xs uppercase tracking-widest">
        <ChevronLeft :size="18" /> Volver al Catálogo
      </button>
      
      <div class="flex items-center gap-2">
         <div class="w-2 h-2 rounded-full" :class="stock > 0 ? 'bg-[#00ED64]' : 'bg-rose-500'"></div>
         <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Almacén: {{ stock > 0 ? 'Disponible' : 'Agotado' }}</span>
      </div>
    </div>

    <StatusHandler :loading="loading" :error="error">
      <div v-if="product" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Media Column -->
        <div class="lg:col-span-5 space-y-6">
          <div class="aspect-square bg-white rounded-[40px] overflow-hidden border border-slate-100 flex items-center justify-center relative group shadow-2xl shadow-slate-200/50">
            <img 
              :src="`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800&sig=${product.sku}`" 
              class="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 group-hover:scale-110"
              alt="Product Image"
            />
            <div class="absolute top-6 left-6 flex flex-col gap-2">
               <span class="px-3 py-1 bg-[#001E2B] text-white text-[9px] font-black uppercase rounded-lg tracking-widest shadow-xl shadow-black/20">PREMIUM HARDWARE</span>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Info :size="16" />
              </div>
              <h3 class="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Ficha de Referencia</h3>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-slate-50">
                <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">SKU Maestro</span>
                <span class="text-sm font-black text-[#001E2B]">{{ product.sku }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-xs text-slate-400 font-bold uppercase tracking-widest">Referencia ID</span>
                <span class="text-[9px] text-slate-300 font-bold tracking-tighter">{{ product.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info & Purchase Column -->
        <div class="lg:col-span-7 flex flex-col pt-4">
          <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
              <span class="px-3 py-1 bg-[#E6FCF5] text-[#00684A] text-[9px] font-black uppercase rounded-lg border border-[#00ED64]/20 tracking-widest">Verificado</span>
              <span 
                class="px-3 py-1 text-[9px] font-black uppercase rounded-lg border tracking-widest"
                :class="product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'"
              >
                {{ product.status }}
              </span>
            </div>
            <h1 class="text-6xl font-black text-[#001E2B] mb-4 tracking-tighter leading-tight">{{ product.name }}</h1>
            <p class="text-5xl font-black text-[#00ED64] drop-shadow-sm">{{ prefs.formatPrice(product.price) }}</p>
          </div>

          <div class="bg-white p-10 rounded-[48px] space-y-10 border border-slate-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
            <!-- Stock Banner Premium -->
            <div class="flex items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 relative group overflow-hidden">
              <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#00ED64]/5 to-transparent"></div>
              <div class="flex items-center gap-6 z-10">
                <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                  <Activity :size="28" :class="stock > 0 ? 'text-[#00ED64]' : 'text-rose-400'" />
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Disponibilidad en Tiempo Real</p>
                  <p class="text-3xl font-black text-[#001E2B]">{{ stock }} <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">unidades</span></p>
                </div>
              </div>
              <div v-if="stock > 0" class="hidden sm:flex flex-col items-end">
                <div class="w-4 h-4 rounded-full bg-[#00ED64] shadow-lg shadow-[#00ED64]/30 animate-pulse"></div>
                <span class="text-[9px] font-black text-[#00684A] uppercase mt-2 tracking-widest">Ready to Ship</span>
              </div>
            </div>

            <!-- Quantity & Actions -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
               <div class="md:col-span-4 space-y-3">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cantidad</label>
                  <div class="relative">
                    <input 
                      v-model="quantity"
                      type="number" 
                      min="1" 
                      :max="stock"
                      class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-2xl font-black outline-none focus:bg-white focus:border-[#00ED64] transition-all text-[#001E2B]"
                    />
                  </div>
               </div>
               <div class="md:col-span-8">
                  <button 
                    @click="handlePurchase"
                    :disabled="purchaseLoading || stock <= 0"
                    class="w-full py-6 bg-[#001E2B] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-black/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Loader2 v-if="purchaseLoading" class="w-6 h-6 animate-spin" />
                    <template v-else>
                      <ShoppingCart :size="20" /> Procesar Adquisición
                    </template>
                  </button>
               </div>
            </div>

            <!-- Feedback -->
            <transition name="fade">
              <div v-if="purchaseFeedback" class="p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4" :class="purchaseFeedback.type === 'success' ? 'bg-[#E6FCF5] text-[#00684A] border border-[#00ED64]/20' : 'bg-rose-50 text-rose-700 border border-rose-100'">
                <CheckCircle2 v-if="purchaseFeedback.type === 'success'" :size="24" />
                <AlertTriangle v-else :size="24" />
                <p class="text-sm font-black">{{ purchaseFeedback.message }}</p>
              </div>
            </transition>
            
            <div class="flex items-center justify-center gap-3 pt-4 border-t border-slate-50">
               <ShieldCheck :size="16" class="text-slate-300" />
               <p class="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
                 Auditado por StoreMaster Core Service
               </p>
            </div>
          </div>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
