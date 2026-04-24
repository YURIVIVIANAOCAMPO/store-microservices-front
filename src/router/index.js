import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/products/ProductList.vue'),
    meta: { auth: true }
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('../views/products/ProductDetail.vue'),
    meta: { auth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/users/UserList.vue'),
    meta: { auth: true, admin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.auth && !auth.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && auth.isAuthenticated) {
    next('/');
  } else if (to.meta.admin && !auth.isAdmin) {
    next('/');
  } else {
    next();
  }
});

export default router;
