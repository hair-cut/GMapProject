// router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const DEMO_EMAIL = process.env.VUE_APP_FIREBASE_DEMO_ACCOUNT;
const DEMO_PASSWORD = process.env.VUE_APP_FIREBASE_DEMO_PASSWORD;
const DEMO_TOKEN = "2f8a7c1e9b4d";

import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue'; 
import HomePage from '../views/HomePage.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/', name: 'HomePage', component: HomePage },
  { path: '/autologin', name: 'AutoLogin', component: HomePage } 
];

const router = createRouter({
  history: createWebHashHistory(),
  base: '/GMapProject/',
  routes
});

// autologin 処理
router.beforeEach((to, from, next) => {
  if (to.path === '/autologin') {

    const token = to.query.token;

    if (token === DEMO_TOKEN) {
      signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD)
        .then(() => {
          next('/'); 
        })
        .catch(() => {
          next('/login');
        });
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
