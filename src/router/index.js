import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      name: 'products',
      component: () => import('../views/products/ProductList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/products/ProductDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('../views/products/ProductManagement.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/users/UserList.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && auth.isAuthenticated) {
    next('/');
  } else if (to.meta.requiresAdmin && auth.user?.role !== 'ROLE_ADMIN') {
    next('/');
  } else {
    next();
  }
});

export default router;
