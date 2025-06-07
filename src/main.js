import { createApp } from 'vue'
import App from './App.vue'
import VueNavigationBar from "vue-navigation-bar";
import router from './router';
import './assets/tailwind.css'

const app = createApp(App)
const script = document.createElement('script')
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VUE_APP_GOOGLE_MAP_API_KEY}&libraries=marker&v=beta`
document.head.appendChild(script)

app.component('navigation-bar', VueNavigationBar)
app.use(router); //Router使用
app.mount('#app')