<template>
  <div id="app">
    <GoogleMap />
  </div>
</template>

<script>
import GoogleMap from './components/GoogleMap.vue'
export default {
  components: { GoogleMap }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>