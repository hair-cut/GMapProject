<template>
  <div class="map-container">
    <GMapMap
      :center="{ lat: 37.5665, lng: 126.9780 }"
      :zoom="12"
      style="width: 100vw; height: 50rem"
      :options="{
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      }"
    >
    </GMapMap>
  </div>
</template>

<script>
import { GMapMap } from '@fawmi/vue-google-maps'

export default {
  components: {
    GMapMap
  }
}
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>