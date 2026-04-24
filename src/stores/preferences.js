import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    currency: 'USD',
    isSidebarCollapsed: false,
    exchangeRates: {
      USD: 1,
      COP: 4000,
      MXN: 18
    },
    toast: {
      show: false,
      message: '',
      type: 'success' // success, error, info
    }
  }),
  
  actions: {
    setCurrency(curr) {
      this.currency = curr;
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 4000);
    },
    formatPrice(value) {
      const rate = this.exchangeRates[this.currency];
      const converted = value * rate;
      
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: this.currency,
        maximumFractionDigits: this.currency === 'COP' ? 0 : 2
      }).format(converted);
    }
  }
});
