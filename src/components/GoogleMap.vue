<script setup>
import { GoogleMap, AdvancedMarker } from 'vue3-google-map'

// 環境変数(VUE APP方式)
const googleMapApiKey = process.env.VUE_APP_GOOGLE_MAP_API_KEY

// 起動時に表紙される位置
const center = { lat: 37.5665, lng: 126.9780 }
const markerOptions = { position: center, label: 'L', title: 'LADY LIBERTY' }
const pinOptions = { background: '#FBBC04' }
</script>

<template>
  <GoogleMap
    :api-key="googleMapApiKey"
    style="width: 100%; height: 95vh"
    :center="center"
    :zoom="15"
  >
    <AdvancedMarker :options="markerOptions" :pin-options="pinOptions" />
    <AdvancedMarker :options="markerOptions">
      <div style="background: white; color: black; padding: 5px; border-radius: 5px">
        Custom Content
      </div>
    </AdvancedMarker>
  </GoogleMap>
</template>