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
    <p class="text-slate-400 font-medium">{{ message || 'Loading data...' }}</p>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center py-12 glass rounded-2xl border-error/20 animate-in zoom-in-95">
    <AlertCircle class="w-12 h-12 text-error mb-4" />
    <p class="text-error font-bold mb-2">Error Occurred</p>
    <p class="text-slate-400 text-center max-w-md px-6">{{ error }}</p>
    <slot name="error-action"></slot>
  </div>

  <div v-else-if="empty" class="flex flex-col items-center justify-center py-12 glass rounded-2xl animate-in slide-in-from-bottom-4">
    <Inbox class="w-12 h-12 text-slate-500 mb-4" />
    <p class="text-slate-300 font-medium">No Results Found</p>
    <p class="text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
  </div>

  <div v-else-if="success" class="flex flex-col items-center justify-center py-12 glass rounded-2xl border-success/20 animate-in zoom-in-95">
    <CheckCircle2 class="w-12 h-12 text-success mb-4" />
    <p class="text-success font-bold mb-2">Operation Successful</p>
    <p class="text-slate-400">{{ message }}</p>
  </div>

  <div v-else>
    <slot></slot>
  </div>
</template>
