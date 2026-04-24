import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    currency: 'USD',
    isSidebarCollapsed: false,
    // Realistic static rates (could be fetched from an API in the future)
    exchangeRates: {
      USD: 1,
      COP: 4000,
      MXN: 18
    },
    toast: {
      show: false,
      message: '',
      type: 'success'
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
    
    // DISPLAY: Format a USD value to the current selected currency
    formatPrice(value) {
      const converted = this.convertFromBase(value);
      return new Intl.NumberFormat(this.getLocale(), {
        style: 'currency',
        currency: this.currency,
        maximumFractionDigits: this.currency === 'COP' ? 0 : 2
      }).format(converted);
    },

    // INTERNAL: Convert USD to Local
    convertFromBase(value) {
      return value * (this.exchangeRates[this.currency] || 1);
    },

    // INTERNAL: Convert Local to USD
    convertToBase(value) {
      return value / (this.exchangeRates[this.currency] || 1);
    },

    getLocale() {
      const locales = { USD: 'en-US', COP: 'es-CO', MXN: 'es-MX' };
      return locales[this.currency] || 'es-CO';
    }
  }
});
