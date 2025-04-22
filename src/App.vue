<template>
  <div id="app">
    <h1>Google Map예제</h1>
    <GoogleMap />
  </div>
</template>

<script>
import GoogleMap from './components/GoogleMap.vue';

export default {
  name: 'App',
  components: {
    GoogleMap
  }
}
</script>