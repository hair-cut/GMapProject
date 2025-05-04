import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Homepage from '../views/HomePage.vue';
import Signup from '../views/Signup.vue';

const routes = [
  { path: '/', name: 'HomePage', component: Homepage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;