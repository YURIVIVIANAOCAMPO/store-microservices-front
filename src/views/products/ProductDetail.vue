<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import { ChevronLeft, Package, ShoppingCart, Loader2, AlertTriangle, CheckCircle2, Box, Info, ShieldCheck } from 'lucide-vue-next';
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
  <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
    <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-semibold">
      <ChevronLeft :size="20" /> Volver al Catálogo
    </button>

    <StatusHandler :loading="loading" :error="error">
      <div v-if="product" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Media Column -->
        <div class="lg:col-span-5 space-y-6">
          <div class="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center relative group">
            <img 
              :src="`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800&sig=${product.sku}`" 
              class="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"
              alt="Product Image"
            />
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <Info :size="16" class="text-primary" />
              <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">Detalles del Sistema</h3>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-slate-50">
                <span class="text-slate-500 font-medium">SKU Maestro</span>
                <span class="font-bold text-slate-900">{{ product.sku }}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-slate-500 font-medium">Referencia ID</span>
                <span class="text-[10px] text-slate-400 font-bold">{{ product.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info & Purchase Column -->
        <div class="lg:col-span-7 flex flex-col">
          <div class="mb-10">
            <div class="flex items-center gap-3 mb-4">
              <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/20">Producto Verificado</span>
              <span 
                class="px-3 py-1 text-[10px] font-black uppercase rounded-lg border"
                :class="product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'"
              >
                {{ product.status }}
              </span>
            </div>
            <h1 class="text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">{{ product.name }}</h1>
            <p class="text-4xl font-black text-primary">{{ prefs.formatPrice(product.price) }}</p>
          </div>

          <div class="bg-white p-8 md:p-10 rounded-3xl space-y-8 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <!-- Stock Banner -->
            <div class="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div class="flex items-center gap-4">
                <!-- Hero Image -->
                <div class="aspect-square bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 flex items-center justify-center relative group">
                  <img 
                    :src="`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800&sig=${product.sku}`" 
                    class="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700"
                    alt="Product Image"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Disponibilidad Actual</p>
                  <p class="text-2xl font-black" :class="stock > 0 ? 'text-slate-900' : 'text-rose-600'">{{ stock }} <span class="text-sm font-medium text-slate-500">unidades en almacén</span></p>
                </div>
              </div>
              <div v-if="stock > 0" class="flex flex-col items-center gap-1">
                <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse"></div>
                <span class="text-[9px] font-bold text-emerald-600 uppercase">En Stock</span>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="space-y-3">
              <div class="flex justify-between items-end">
                <label class="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Cantidad de Pedido</label>
                <span class="text-xs font-bold text-slate-400">Máximo permitido: {{ stock }}</span>
              </div>
              <input 
                v-model="quantity"
                type="number" 
                min="1" 
                :max="stock"
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-3xl font-black outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
              />
            </div>

            <!-- Feedback -->
            <div v-if="purchaseFeedback" class="animate-in slide-in-from-top-2">
              <div 
                v-if="purchaseFeedback.type === 'success'"
                class="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-3"
              >
                <CheckCircle2 :size="20" />
                <p class="text-sm font-bold">{{ purchaseFeedback.message }}</p>
              </div>
              <div 
                v-else
                class="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center gap-3"
              >
                <AlertTriangle :size="20" />
                <p class="text-sm font-bold">{{ purchaseFeedback.message }}</p>
              </div>
            </div>

            <!-- Action -->
            <button 
              @click="handlePurchase"
              :disabled="purchaseLoading || stock <= 0"
              class="w-full py-6 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              <Loader2 v-if="purchaseLoading" class="w-6 h-6 animate-spin" />
              <template v-else>
                <ShoppingCart :size="24" /> Procesar Compra
              </template>
            </button>
            
            <div class="flex items-center justify-center gap-2 pt-2">
               <ShieldCheck :size="14" class="text-slate-400" />
               <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 Transacción Segura vía Inventory Service
               </p>
            </div>
          </div>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
