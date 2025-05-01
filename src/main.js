import { createApp } from 'vue'
import App from './App.vue'
import VueNavigationBar from "vue-navigation-bar";

const app = createApp(App)

app.component('navigation-bar', VueNavigationBar)

app.mount('#app')