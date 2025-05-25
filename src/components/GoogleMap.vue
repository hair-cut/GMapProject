<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const center = { lat: 37.5665, lng: 126.9780 }
const mapId = process.env.VUE_APP_GOOGLE_MAP_ID
const photos = ref([])
const user = ref(null)

let map = null
let markers = []

// Google Maps APIがロードされるのを待つ関数
function waitForGoogleMaps() {
  return new Promise(resolve => {
    if (window.google && window.google.maps && window.google.maps.marker) {
      resolve()
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.marker) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    }
  })
}

onMounted(async () => {
  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser
    if (!user.value || !user.value.uid) return //ログインしていない場合は何もしない
    // 写真目録を呼ぶ
    try {
      const res = await fetch(`http://localhost:3001/list?uid=${user.value.uid}`)
      if (!res.ok) throw new Error('サーバが応答しません。')
      const data = await res.json()
      photos.value = Array.isArray(data.photos) ? data.photos : []
      console.log('サーバから貰った写真:', photos.value)
    } catch (error) {
      console.error('写真呼びエラー:', error)
      alert('エラー発生: ' + (error.message || error))
      return
    }

    await waitForGoogleMaps()

    // 地図の初期化
    map = new window.google.maps.Map(document.getElementById('map'), {
      center,
      zoom: 15,
      mapId
    })

    // 4. AdvancedMarkerViewでマーカーを作成
    markers = photos.value
      .filter(photo => photo.lat && photo.lng)
      .map(photo => {
        const img = document.createElement('img')
        img.src = photo.url
        img.style.width = '48px'
        img.style.height = '48px'
        img.style.borderRadius = '8px'
        img.style.objectFit = 'cover'
        img.style.border = '2px solid #fff'
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'

        return new window.google.maps.marker.AdvancedMarkerView({
          map,
          position: { lat: photo.lat, lng: photo.lng },
          content: img
        })
      })
  })
})

onBeforeUnmount(() => {
  // マーカーを削除
  markers.forEach(marker => marker.map = null)
})
</script>

<template>
  <div id="map" style="width: 100%; height: 95vh"></div>
</template>