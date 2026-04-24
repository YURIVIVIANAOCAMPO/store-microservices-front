<!-- StatusHandler.vue -->
<script setup>
import { Loader2, AlertCircle, Inbox, CheckCircle2 } from 'lucide-vue-next';

defineProps({
  loading: Boolean,
  error: String,
  empty: Boolean,
  success: Boolean,
  message: String
});
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center py-12 animate-in fade-in">
    <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
    <p class="text-slate-400 font-medium">{{ message || 'Cargando información...' }}</p>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center py-12 bg-white border border-rose-100 rounded-lg shadow-sm animate-in zoom-in-95">
    <AlertCircle class="w-12 h-12 text-rose-500 mb-4" />
    <p class="text-rose-600 font-bold mb-2">Error de Operación</p>
    <p class="text-slate-400 text-center max-w-md px-6 text-sm">{{ error }}</p>
    <slot name="error-action"></slot>
  </div>

  <div v-else-if="empty" class="flex flex-col items-center justify-center py-12 bg-white border border-slate-200 rounded-lg shadow-sm animate-in slide-in-from-bottom-4">
    <Inbox class="w-12 h-12 text-slate-300 mb-4" />
    <p class="text-slate-400 font-bold">No Documents Found</p>
    <p class="text-slate-400 text-xs">The current filter returned zero results.</p>
  </div>

  <div v-else-if="success" class="flex flex-col items-center justify-center py-12 bg-white border border-primary/20 rounded-lg shadow-sm animate-in zoom-in-95">
    <CheckCircle2 class="w-12 h-12 text-primary mb-4" />
    <p class="text-primary font-bold mb-2">Command Successful</p>
    <p class="text-slate-400 text-sm">{{ message }}</p>
  </div>

  <div v-else>
    <slot></slot>
  </div>
</template>
