<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "vue-router";

const DEMO_EMAIL = process.env.VUE_APP_FIREBASE_DEMO_ACCOUNT;
const DEMO_PASSWORD = process.env.VUE_APP_FIREBASE_DEMO_PASSWORD;
const DEMO_TOKEN = "2f8a7c1e9b4d";

export default {
  name: 'App',
  setup() {
    const router = useRouter();

    router.afterEach((to) => {
      if (to.path === '/autologin') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autologin') === DEMO_TOKEN) {
          signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD)
            .catch(() => {

            });
        }
      }
    });

    return {};
  },
};
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>