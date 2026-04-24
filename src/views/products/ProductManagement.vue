<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../../stores/products';
import { usePreferencesStore } from '../../stores/preferences';
import { 
  Plus, Search, Edit2, Trash2, Package, 
  Filter, ChevronRight, AlertCircle, CheckCircle, 
  Loader2, X, Archive, Tag, DollarSign
} from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const productStore = useProductStore();
const prefs = usePreferencesStore();
const search = ref('');
const showModal = ref(false);
const editingProduct = ref(null);
const loadingAction = ref(false);
const feedback = ref(null);

const form = ref({
  name: '',
  sku: '',
  price: 0,
  status: 'ACTIVE'
});

const fetchProducts = () => productStore.fetchProducts({ search: search.value }, true);

onMounted(() => fetchProducts());

const openCreate = () => {
  editingProduct.value = null;
  form.value = { name: '', sku: '', price: 0, status: 'ACTIVE' };
  showModal.value = true;
};

const openEdit = (product) => {
  editingProduct.value = product;
  form.value = { ...product };
  showModal.value = true;
};

const handleSubmit = async () => {
  loadingAction.value = true;
  let result;
  if (editingProduct.value) {
    result = await productStore.updateProduct(editingProduct.value.id, form.value);
  } else {
    result = await productStore.createProduct(form.value);
  }

  if (result.success) {
    showModal.value = false;
    fetchProducts();
    feedback.value = { type: 'success', message: `Producto ${editingProduct.value ? 'actualizado' : 'creado'} correctamente` };
  } else {
    feedback.value = { type: 'error', message: result.message };
  }
  loadingAction.value = false;
};

const confirmDelete = async (id) => {
  if (confirm('¿Desea eliminar permanentemente este producto del catálogo?')) {
    loadingAction.value = true;
    const result = await productStore.deleteProduct(id);
    if (result.success) {
      fetchProducts();
      feedback.value = { type: 'success', message: 'Producto eliminado del catálogo' };
    } else {
      feedback.value = { type: 'error', message: result.message };
    }
    loadingAction.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-secondary tracking-tight">Gestión de Inventario</h1>
        <p class="text-[13px] text-slate-500 mt-1">Control maestro de productos, precios y existencias globales.</p>
      </div>
      <button 
        @click="openCreate"
        class="bg-primary hover:bg-primary-hover text-secondary px-5 py-2.5 rounded font-bold text-[13px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
      >
        <Plus :size="16" /> Añadir Producto
      </button>
    </div>

    <!-- Feedback -->
    <div v-if="feedback" class="animate-in slide-in-from-top-2">
      <div 
        class="p-3 rounded border flex items-center gap-3"
        :class="feedback.type === 'success' ? 'bg-[#E6FCF5] border-[#00ED64]/30 text-[#00684A]' : 'bg-rose-50 border-rose-100 text-rose-700'"
      >
        <CheckCircle v-if="feedback.type === 'success'" :size="18" />
        <AlertCircle v-else :size="18" />
        <p class="text-[13px] font-bold">{{ feedback.message }}</p>
        <button @click="feedback = null" class="ml-auto opacity-40 hover:opacity-100"><X :size="14" /></button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white border border-border rounded shadow-sm flex items-center px-4 py-3 gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
        <input 
          v-model="search"
          @keyup.enter="fetchProducts"
          type="text" 
          placeholder="Buscar por nombre o SKU..." 
          class="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-10 pr-4 text-[13px] focus:bg-white focus:border-accent outline-none transition-all"
        />
      </div>
      <button @click="fetchProducts" class="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-secondary px-3 py-2">
        <Filter :size="14" /> Filtrar Lista
      </button>
    </div>

    <!-- Table -->
    <StatusHandler :loading="productStore.loading" :empty="productStore.products.length === 0">
      <div class="bg-white border border-border rounded shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th class="px-6 py-4 text-left">Detalles del Producto</th>
              <th class="px-6 py-4 text-left">Estado del Catálogo</th>
              <th class="px-6 py-4 text-left">Precio Unitario</th>
              <th class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="product in productStore.products" :key="product.id" class="hover:bg-slate-50/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:text-primary group-hover:border-primary/30 transition-all">
                    <Package :size="16" />
                  </div>
                  <div>
                    <p class="text-[13px] font-bold text-secondary">{{ product.name }}</p>
                    <p class="text-[10px] font-mono text-slate-400">SKU: {{ product.sku }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                  :class="product.status === 'ACTIVE' ? 'bg-[#E6FCF5] text-[#00684A] border border-[#00ED64]/30' : 'bg-slate-100 text-slate-500 border border-slate-200'"
                >
                  {{ product.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <p class="text-[13px] font-bold text-secondary">{{ prefs.formatPrice(product.price) }}</p>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEdit(product)" class="p-1.5 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded" title="Editar Producto">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="confirmDelete(product.id)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Eliminar Producto">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </StatusHandler>

    <!-- Modal (MongoDB Atlas Style) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-secondary/80 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="bg-white w-full max-w-md rounded shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 class="text-sm font-black uppercase tracking-widest text-secondary">{{ editingProduct ? 'Modificar' : 'Añadir' }} Producto</h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-secondary"><X :size="20" /></button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="text-[12px] font-bold text-slate-700">Nombre Comercial</label>
            <input v-model="form.name" type="text" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[12px] font-bold text-slate-700">SKU</label>
              <input v-model="form.sku" type="text" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[12px] font-bold text-slate-700">Precio (USD)</label>
              <input v-model="form.price" type="number" step="0.01" required class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[12px] font-bold text-slate-700">Estado en Catálogo</label>
            <select v-model="form.status" class="w-full bg-slate-50 border border-border rounded py-2 px-3 text-[13px] outline-none focus:border-accent transition-all appearance-none">
              <option value="ACTIVE">Activo y Visible</option>
              <option value="INACTIVE">Inactivo (Oculto)</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all border border-border rounded">
              Cancelar
            </button>
            <button type="submit" :disabled="loadingAction" class="flex-1 px-4 py-2 bg-secondary text-white text-[13px] font-bold rounded hover:bg-black flex items-center justify-center gap-2">
              <Loader2 v-if="loadingAction" class="animate-spin" :size="16" />
              <span>{{ editingProduct ? 'Actualizar Producto' : 'Crear Producto' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
