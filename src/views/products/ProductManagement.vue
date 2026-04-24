<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../../stores/products';
import { 
  Plus, Search, Edit2, Trash2, Package, 
  MoreVertical, Filter, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Loader2, X
} from 'lucide-vue-next';
import StatusHandler from '../../components/ui/StatusHandler.vue';

const productStore = useProductStore();
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
  feedback.value = null;
  
  let result;
  if (editingProduct.value) {
    result = await productStore.updateProduct(editingProduct.value.id, form.value);
  } else {
    result = await productStore.createProduct(form.value);
  }

  if (result.success) {
    showModal.value = false;
    fetchProducts();
    feedback.value = { type: 'success', message: `Producto ${editingProduct.value ? 'actualizado' : 'creado'} exitosamente` };
  } else {
    feedback.value = { type: 'error', message: result.message };
  }
  loadingAction.value = false;
};

const confirmDelete = async (id) => {
  if (confirm('¿Está seguro de que desea eliminar este producto?')) {
    loadingAction.value = true;
    const result = await productStore.deleteProduct(id);
    if (result.success) {
      fetchProducts();
      feedback.value = { type: 'success', message: 'Producto eliminado correctamente' };
    } else {
      feedback.value = { type: 'error', message: result.message };
    }
    loadingAction.value = false;
  }
};
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Productos</h1>
        <p class="text-slate-500 text-sm mt-1">Administre el catálogo maestro de su organización.</p>
      </div>
      <button 
        @click="openCreate"
        class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
      >
        <Plus :size="20" /> Nuevo Producto
      </button>
    </div>

    <!-- Filters & Feedback -->
    <div class="space-y-4">
      <div v-if="feedback" class="animate-in slide-in-from-top-2">
        <div 
          class="p-4 rounded-xl flex items-center gap-3"
          :class="feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'"
        >
          <CheckCircle v-if="feedback.type === 'success'" :size="20" />
          <AlertCircle v-else :size="20" />
          <p class="text-sm font-semibold">{{ feedback.message }}</p>
          <button @click="feedback = null" class="ml-auto opacity-50 hover:opacity-100">
            <X :size="16" />
          </button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="20" />
          <input 
            v-model="search"
            @keyup.enter="fetchProducts"
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white focus:border-primary transition-all"
          />
        </div>
        <button @click="fetchProducts" class="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
          Filtrar
        </button>
      </div>
    </div>

    <!-- Table -->
    <StatusHandler :loading="productStore.loading" :empty="productStore.products.length === 0">
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                <th class="px-6 py-4">Producto</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4">Precio</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="product in productStore.products" :key="product.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Package :size="20" />
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ product.name }}</p>
                      <p class="text-xs text-slate-500 font-mono tracking-tight">{{ product.sku }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    :class="product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <p class="font-bold text-slate-900">${{ product.price }}</p>
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="openEdit(product)"
                      class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 :size="18" />
                    </button>
                    <button 
                      @click="confirmDelete(product.id)"
                      class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </StatusHandler>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-slate-900">{{ editingProduct ? 'Editar' : 'Crear' }} Producto</h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="24" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2 space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Nombre del Producto</label>
              <input v-model="form.name" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-primary transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">SKU</label>
              <input v-model="form.sku" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-primary transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Precio</label>
              <input v-model="form.price" type="number" step="0.01" required class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-primary transition-all" />
            </div>
            <div class="col-span-2 space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Estado</label>
              <select v-model="form.status" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-primary transition-all appearance-none">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 px-6 py-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" :disabled="loadingAction" class="flex-1 px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all">
              <Loader2 v-if="loadingAction" class="animate-spin" :size="20" />
              <span>{{ editingProduct ? 'Actualizar' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
