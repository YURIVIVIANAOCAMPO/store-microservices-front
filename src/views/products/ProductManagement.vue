<script setup>
import { ref, onMounted, watch } from 'vue';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import { 
  Plus, Search, Edit2, Trash2, Package, 
  Filter, ChevronRight, AlertCircle, CheckCircle, 
  Loader2, X, Archive, Tag, DollarSign, Activity, ArrowUpRight, TrendingUp
} from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const productStore = useProductStore();
const prefs = usePreferencesStore();
const search = ref('');
const showModal = ref(false);
const showConfirmModal = ref(false);
const showStockModal = ref(false);
const editingProduct = ref(null);
const loadingAction = ref(false);
const productToDelete = ref(null);
const stockToUpdate = ref({ id: '', name: '', stock: 0 });

const form = ref({
  name: '',
  sku: '',
  price: 0,
  status: 'ACTIVE',
  initialStock: 0
});

const fetchProducts = async () => {
  await productStore.fetchProducts({ search: search.value }, true);
  productStore.products.forEach(p => productStore.fetchStock(p.id));
};

onMounted(() => fetchProducts());

const openCreate = () => {
  editingProduct.value = null;
  let nextId = 1;
  if (productStore.products.length > 0) {
    const skus = productStore.products.map(p => {
        const match = p.sku.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }).filter(n => !isNaN(n));
    if (skus.length > 0) nextId = Math.max(...skus) + 1;
  }
  form.value = { name: '', sku: `PROD-${String(nextId).padStart(3, '0')}`, price: 0, status: 'ACTIVE', initialStock: 10 };
  showModal.value = true;
};

const openEdit = (product) => {
  editingProduct.value = product;
  // Convert from USD base to current local currency for the input field
  const localPrice = prefs.convertFromBase(product.price);
  form.value = { ...product, price: localPrice, initialStock: productStore.inventory[product.id] || 0 };
  showModal.value = true;
};

const handleSubmit = async () => {
  loadingAction.value = true;
  
  // Convert price back to USD base before sending to server
  const basePrice = prefs.convertToBase(form.value.price);
  const payload = { ...form.value, price: basePrice };

  let result = editingProduct.value ? await productStore.updateProduct(editingProduct.value.id, payload) : await productStore.createProduct(payload);
  if (result.success) {
    showModal.value = false;
    fetchProducts();
    prefs.showToast(`Producto ${editingProduct.value ? 'actualizado' : 'creado'} correctamente`, 'success');
  } else {
    prefs.showToast(result.message, 'error');
  }
  loadingAction.value = false;
};

const openStockAdjustment = (product) => {
  stockToUpdate.value = { 
    id: product.id, 
    name: product.name,
    stock: 0 
  };
  showStockModal.value = true;
};

const handleSyncStock = async () => {
  if (!productStore.syncStock) {
    prefs.showToast('Error: Acción syncStock no encontrada en el store', 'error');
    return;
  }
  
  loadingAction.value = true;
  const result = await productStore.syncStock(stockToUpdate.value.id, stockToUpdate.value.stock);
  if (result.success) {
    showStockModal.value = false;
    fetchProducts();
    prefs.showToast(`Inventario de "${stockToUpdate.value.name}" actualizado.`, 'success');
  } else {
    prefs.showToast(result.message, 'error');
  }
  loadingAction.value = false;
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showConfirmModal.value = true;
};

const handleDelete = async () => {
  loadingAction.value = true;
  const result = await productStore.deleteProduct(productToDelete.value.id);
  if (result.success) {
    fetchProducts();
    showConfirmModal.value = false;
    prefs.showToast('Producto eliminado permanentemente', 'success');
  } else {
    prefs.showToast(result.message, 'error');
  }
  loadingAction.value = false;
};
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#E8EDEB]">
      <div>
        <h1 class="text-3xl font-black text-[#001E2B] tracking-tighter">Control de Activos</h1>
        <p class="text-sm text-slate-500 font-medium">Sincronización maestra entre el catálogo y el almacén físico.</p>
      </div>
      <button @click="openCreate" class="w-full sm:w-auto px-6 py-3 bg-[#00ED64] text-[#001E2B] rounded-lg font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#00ED64]/20 hover:scale-[1.02] transition-all">
        <Plus :size="18" /> Registrar Producto
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
        <input v-model="search" @keyup.enter="fetchProducts" type="text" placeholder="Buscar por SKU o Nombre..." class="w-full bg-white border border-[#E8EDEB] rounded-lg py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#00ED64] transition-all shadow-sm" />
      </div>
    </div>

    <!-- Table / Responsive List -->
    <StatusHandler :loading="productStore.loading" :empty="productStore.products.length === 0">
      <!-- Mobile View (Cards) -->
      <div class="grid grid-cols-1 gap-4 lg:hidden">
        <div v-for="product in productStore.products" :key="product.id" class="bg-white border border-[#E8EDEB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-[#E8EDEB]">
                <Package :size="20" />
              </div>
              <div>
                <p class="text-sm font-black text-[#001E2B] leading-tight">{{ product.name }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ product.sku }}</p>
              </div>
            </div>
            <span class="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border" :class="product.status === 'ACTIVE' ? 'bg-[#E6FCF5] text-[#00684A] border-[#00ED64]/30' : 'bg-slate-50 text-slate-400 border-slate-200'">
              {{ product.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
            <div>
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">MSRP</p>
              <p class="text-sm font-black text-secondary">{{ prefs.formatPrice(product.price) }}</p>
            </div>
            <div>
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Inventario</p>
              <button 
                @click="openStockAdjustment(product)"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-[#00ED64]/30 transition-all"
              >
                <div class="w-1.5 h-1.5 rounded-full" :class="(productStore.inventory[product.id] || 0) > 10 ? 'bg-[#00ED64]' : 'bg-rose-500'"></div>
                <span class="text-xs font-black">{{ productStore.inventory[product.id] ?? 0 }}</span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
            <button @click="openEdit(product)" class="flex-1 py-2.5 bg-slate-50 text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              <Edit2 :size="14" /> Editar
            </button>
            <button @click="confirmDelete(product)" class="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden lg:block bg-white border border-[#E8EDEB] rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50 border-b border-[#E8EDEB] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th class="px-8 py-6">Componente Técnico</th>
              <th class="px-8 py-6">Estado</th>
              <th class="px-8 py-6">Precio MSRP</th>
              <th class="px-8 py-6">Inventario Real</th>
              <th class="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="product in productStore.products" :key="product.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-[#E8EDEB] group-hover:bg-[#00ED64]/10 group-hover:text-[#00ED64] group-hover:border-[#00ED64]/20 transition-all">
                    <Package :size="22" />
                  </div>
                  <div>
                    <p class="text-sm font-black text-[#001E2B]">{{ product.name }}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ product.sku }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border" :class="product.status === 'ACTIVE' ? 'bg-[#E6FCF5] text-[#00684A] border-[#00ED64]/30' : 'bg-slate-50 text-slate-400 border-slate-200'">{{ product.status }}</span>
              </td>
              <td class="px-8 py-6">
                <span class="text-sm font-black text-[#001E2B]">{{ prefs.formatPrice(product.price) }}</span>
              </td>
              <td class="px-8 py-6">
                <button 
                  @click="openStockAdjustment(product)" 
                  class="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#001E2B] hover:text-white transition-all group/stock border border-transparent hover:border-[#00ED64]/30"
                  title="Click para ajustar stock"
                >
                  <div class="w-2 h-2 rounded-full" :class="(productStore.inventory[product.id] || 0) > 10 ? 'bg-[#00ED64]' : ((productStore.inventory[product.id] || 0) > 0 ? 'bg-amber-400' : 'bg-rose-500')"></div>
                  <span class="text-sm font-black">{{ productStore.inventory[product.id] ?? 0 }}</span>
                  <Activity :size="14" class="text-slate-300 group-hover/stock:text-[#00ED64] transition-colors" />
                </button>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEdit(product)" class="p-3 text-slate-300 hover:text-[#001E2B] hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-[#E8EDEB]"><Edit2 :size="18" /></button>
                  <button @click="confirmDelete(product)" class="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 :size="18" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </StatusHandler>

    <!-- Modal: Stock Adjustment (FIXED BACKDROP) -->
    <div v-if="showStockModal" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-[#001E2B]/90 backdrop-blur-md" @click="showStockModal = false"></div>
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
         <div class="bg-[#00ED64] p-8 text-[#001E2B] relative">
            <TrendingUp class="absolute right-6 top-6 opacity-20" :size="80" />
            <h2 class="text-2xl font-black tracking-tighter mb-1">Ajuste de Inventario</h2>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Hardware ID: {{ stockToUpdate.id.split('-')[0] }}</p>
         </div>
         
         <div class="p-10 space-y-8">
            <div class="text-center">
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Unidades a Incrementar</p>
                <div class="flex items-center justify-center gap-8">
                  <div class="flex-1"></div>
                  <input 
                    v-model.number="stockToUpdate.stock" 
                    type="number" 
                    min="0"
                    class="w-40 text-center text-7xl font-black text-[#001E2B] outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button 
                    type="button"
                    @click="stockToUpdate.stock = (Number(stockToUpdate.stock) || 0) + 1" 
                    class="w-20 h-20 rounded-3xl bg-[#00ED64] text-[#001E2B] hover:bg-white border-2 border-transparent hover:border-[#00ED64] transition-all text-4xl font-black flex items-center justify-center shadow-xl shadow-[#00ED64]/20 active:scale-90"
                  >
                    +
                  </button>
                  <div class="flex-1"></div>
                </div>
            </div>

            <div class="space-y-4">
               <button @click="handleSyncStock" :disabled="loadingAction" class="w-full py-5 bg-[#001E2B] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-[#001E2B]/20 flex items-center justify-center gap-3">
                  <Loader2 v-if="loadingAction" class="animate-spin" :size="18" />
                  <template v-else>
                     <Activity :size="18" /> Sincronizar Stock
                  </template>
               </button>
               <button @click="showStockModal = false" class="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-secondary">Cancelar Operación</button>
            </div>
         </div>
         
         <div class="px-10 py-4 bg-slate-50 border-t border-[#E8EDEB] flex items-center gap-3">
            <ArrowUpRight :size="14" class="text-[#00ED64]" />
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sincronización directa con Inventory-Service (8081)</p>
         </div>
      </div>
    </div>

    <!-- Modal: Confirm Delete -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-rose-950/80 backdrop-blur-md" @click="showConfirmModal = false"></div>
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative p-10 text-center animate-in zoom-in-95">
        <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-sm">
           <Trash2 :size="36" />
        </div>
        <h2 class="text-2xl font-black text-[#001E2B] tracking-tighter mb-2">¿Revocar Activo?</h2>
        <p class="text-sm text-slate-500 mb-8 leading-relaxed">Estás a punto de eliminar <b>{{ productToDelete?.name }}</b>. Esta acción borrará el metadato del catálogo maestro permanentemente.</p>
        <div class="flex flex-col gap-3">
           <button @click="handleDelete" :disabled="loadingAction" class="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20">
              <Loader2 v-if="loadingAction" class="animate-spin" :size="18" />
              <span>Confirmar Eliminación</span>
           </button>
           <button @click="showConfirmModal = false" class="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest">Abortar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Standard Form -->
    <div v-if="showModal" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-[#001E2B]/90 backdrop-blur-md" @click="showModal = false"></div>
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-8 py-6 border-b border-[#E8EDEB] flex items-center justify-between bg-slate-50/50">
          <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ED64]">{{ editingProduct ? 'Actualizar' : 'Registrar' }} Hardware</h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-secondary"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
            <input v-model="form.name" type="text" required class="w-full bg-slate-50 border border-[#E8EDEB] rounded-xl py-4 px-5 text-sm font-bold outline-none focus:bg-white focus:border-[#00ED64] transition-all" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código SKU</label>
              <input v-model="form.sku" type="text" required class="w-full bg-slate-50 border border-[#E8EDEB] rounded-xl py-4 px-5 text-sm font-bold outline-none focus:bg-white focus:border-[#00ED64] transition-all" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio MSRP ({{ prefs.currency }})</label>
              <input v-model="form.price" type="number" step="0.01" required class="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-5 text-sm font-bold outline-none focus:bg-white focus:border-[#00ED64] transition-all" />
            </div>
          </div>
          <div v-if="!editingProduct" class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Inicial (Servicio 8081)</label>
            <input v-model="form.initialStock" type="number" min="0" required class="w-full bg-slate-50 border border-[#E8EDEB] rounded-xl py-4 px-5 text-sm font-bold outline-none focus:bg-white focus:border-[#00ED64] transition-all" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Operativo</label>
            <select v-model="form.status" class="w-full bg-slate-50 border border-[#E8EDEB] rounded-xl py-4 px-5 text-sm font-bold outline-none focus:bg-white focus:border-[#00ED64] transition-all appearance-none">
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
          <div class="flex gap-4 pt-6">
            <button type="button" @click="showModal = false" class="flex-1 py-4 text-[11px] font-black text-slate-400 hover:text-[#001E2B] uppercase tracking-widest">Cancelar</button>
            <button type="submit" :disabled="loadingAction" class="flex-1 py-4 bg-[#001E2B] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#001E2B]/20">
              <Loader2 v-if="loadingAction" class="animate-spin" :size="16" />
              <span>Sincronizar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
