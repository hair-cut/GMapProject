import { createApp } from 'vue'
import App from './App.vue'
import VueNavigationBar from "vue-navigation-bar";
import router from './router';

const app = createApp(App)

app.component('navigation-bar', VueNavigationBar)
app.use(router); //Router使用
app.mount('#app')