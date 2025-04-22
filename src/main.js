import { createApp } from 'vue'
import App from './App.vue'
import VueGoogleMaps from '@fawmi/vue-google-maps'

const app = createApp(App)
const GMapAPI = process.env.VUE_APP_GOOGLE_MAP_API_KEY

app.use(VueGoogleMaps, {
  load: {
    key: GMapAPI,
  },
})

app.mount('#app')