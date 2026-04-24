<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { useProductStore } from '../../stores/products';
import { ChevronLeft, Package, ShoppingCart, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
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

const fetchDetail = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get(`/products/${route.params.id}`);
    product.value = res.data.data;
  } catch (err) {
    error.value = err.friendlyMessage || 'Failed to load product details';
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchDetail());

const handlePurchase = async () => {
  purchaseLoading.value = true;
  purchaseFeedback.value = null;
  
  const result = await productStore.purchaseProduct(product.value.id, quantity.value);
  
  if (result.success) {
    purchaseFeedback.value = { type: 'success', message: 'Purchase completed successfully!' };
    // Optionally refresh detail to see updated stock if backend supports it
  } else {
    purchaseFeedback.value = { type: 'error', message: result.message };
  }
  
  purchaseLoading.value = false;
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <button @click="router.back()" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
      <ChevronLeft :size="20" /> Back to Catalog
    </button>

    <StatusHandler :loading="loading" :error="error">
      <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Product Info -->
        <div class="space-y-6">
          <div class="glass p-10 rounded-3xl flex items-center justify-center aspect-square">
            <Package :size="120" class="text-primary/40" />
          </div>
          
          <div class="glass p-6 rounded-2xl border-white/5">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Product Details</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">SKU</span>
                <span class="font-mono text-white">{{ product.sku }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Created</span>
                <span class="text-white">{{ new Date(product.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Last Update</span>
                <span class="text-white">{{ new Date(product.updatedAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Purchase Actions -->
        <div class="flex flex-col">
          <div class="mb-8">
            <span class="text-primary font-black uppercase tracking-wider text-sm mb-2 block">Premium Item</span>
            <h1 class="text-5xl font-black mb-4">{{ product.name }}</h1>
            <p class="text-3xl font-black text-slate-100">${{ product.price }}</p>
          </div>

          <div class="glass p-8 rounded-3xl space-y-8 border-white/5 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4">
              <div class="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Stock Verified
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-sm font-bold text-slate-400">Purchase Quantity</label>
              <div class="flex items-center gap-4">
                <input 
                  v-model="quantity"
                  type="number" 
                  min="1" 
                  class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-4 text-xl font-bold outline-none focus:border-primary transition-all"
                />
              </div>
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
              :disabled="purchaseLoading"
              class="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 transition-all active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="purchaseLoading" class="w-6 h-6 animate-spin" />
              <template v-else>
                <ShoppingCart :size="24" /> Confirm Purchase
              </template>
            </button>
            
            <p class="text-center text-xs text-slate-500">
              Immediate processing and encrypted transaction
            </p>
          </div>
        </div>
      </div>
    </StatusHandler>
  </div>
</template>
