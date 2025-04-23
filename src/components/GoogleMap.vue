<template>
  <div class="map-container">
    <!-- gestureHandling : マウスで地図の拡大と縮小可能 -->
    <GMapMap
      :center="{ lat: 37.5665, lng: 126.9780 }"
      :zoom="12"
      style="width: 100%; height: 100%;"
      :options="{ gestureHandling: 'greedy' }"
    />
  </div>
</template>

<script>
import { GMapMap } from '@fawmi/vue-google-maps'
export default {
  components: { GMapMap }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>