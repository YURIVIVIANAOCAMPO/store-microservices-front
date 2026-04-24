<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { useProductStore } from '../../stores/products';
import { ChevronLeft, Package, ShoppingCart, Loader2, AlertTriangle, CheckCircle2, Box } from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const purchaseLoading = ref(false);
const purchaseFeedback = ref(null);

const stock = computed(() => productStore.inventory[route.params.id] || 0);

const fetchDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get(`/products/${route.params.id}`);
    product.value = res.data.data;
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
  } else {
    purchaseFeedback.value = { type: 'error', message: result.message };
  }
  
  purchaseLoading.value = false;
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <button @click="router.back()" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
      <ChevronLeft :size="20" /> Volver al Catálogo
    </button>

    <StatusHandler :loading="loading" :error="error">
      <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Info -->
        <div class="space-y-6">
          <div class="glass p-10 rounded-3xl flex items-center justify-center aspect-square">
            <Package :size="120" class="text-primary/40" />
          </div>
          
          <div class="glass p-6 rounded-2xl border-white/5 bg-slate-800/20">
            <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Información Técnica</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">SKU</span>
                <span class="font-mono text-white">{{ product.sku }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">ID</span>
                <span class="font-mono text-[10px] text-slate-500">{{ product.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Compra -->
        <div class="flex flex-col">
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase rounded">Oficial</span>
              <span 
                class="px-2 py-0.5 text-[10px] font-black uppercase rounded"
                :class="product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'"
              >
                {{ product.status }}
              </span>
            </div>
            <h1 class="text-5xl font-black mb-4 leading-tight">{{ product.name }}</h1>
            <p class="text-4xl font-black text-white">${{ product.price }}</p>
          </div>

          <div class="glass p-8 rounded-3xl space-y-8 border-white/5 relative overflow-hidden bg-white/5">
            <div class="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
              <div class="flex items-center gap-3">
                <Box class="text-primary" :size="20" />
                <div>
                  <p class="text-xs text-slate-500 font-bold uppercase">Stock Disponible</p>
                  <p class="text-xl font-black" :class="stock > 0 ? 'text-white' : 'text-rose-500'">{{ stock }} unidades</p>
                </div>
              </div>
              <div v-if="stock > 0" class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            <div class="space-y-4">
              <label class="block text-sm font-black text-slate-400 uppercase tracking-wider">Cantidad a comprar</label>
              <input 
                v-model="quantity"
                type="number" 
                min="1" 
                :max="stock"
                class="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div v-if="purchaseFeedback" class="animate-in slide-in-from-top-2">
              <div 
                v-if="purchaseFeedback.type === 'success'"
                class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-3"
              >
                <CheckCircle2 :size="20" />
                <p class="text-sm font-bold">{{ purchaseFeedback.message }}</p>
              </div>
              <div 
                v-else
                class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3"
              >
                <AlertTriangle :size="20" />
                <p class="text-sm font-bold">{{ purchaseFeedback.message }}</p>
              </div>
            </div>

            <button 
              @click="handlePurchase"
              :disabled="purchaseLoading || stock <= 0"
              class="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <Loader2 v-if="purchaseLoading" class="w-6 h-6 animate-spin" />
              <template v-else>
                <ShoppingCart :size="24" /> Confirmar Compra
              </template>
            </button>
            
            <p class="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Transacción protegida por Inventory Service
            </p>
          </div>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
