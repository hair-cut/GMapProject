<template>
  <div id="app">
    <AppMenu />
    <GoogleMap />
  </div>
</template>

<script>
import AppMenu from './components/Menu.vue'
import GoogleMap from './components/GoogleMap.vue'

export default {
  components: {
    AppMenu,
    GoogleMap
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>