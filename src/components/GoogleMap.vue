<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

// 環境に応じてAPIのベースURLを設定
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://my-web-app--gmapproject-2ea97.asia-east1.hosted.app'

const center = { lat: 35.681236, lng: 139.767125 }
const mapId = process.env.VUE_APP_GOOGLE_MAP_ID
const photos = ref([])
const user = ref(null)

let map = null
let markers = []

const selectedPhoto = ref(null)
const showModal = ref(false)
const photoAddress = ref('')

// 共有ユーザーのUIDごとに色を割り当てるマップ
const sharedUidColorMap = ref({})

// uidごとに色を割り当てる関数
function getUidColorMap(uids) {
  const colorList = [
    '#ff3b30', 
    '#ff9500', 
    '#ffcc00', 
    '#4cd964', 
    '#5ac8fa', 
    '#007aff', 
    '#5856d6', 
    '#ff2d55', 
  ]
  const map = {}
  uids.forEach((uid, idx) => {
    map[uid] = colorList[idx % colorList.length]
  })
  return map
}

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

// コンポーネントがアンマウントされる時にマーカーを削除
//（理由：画面遷移時にマーカーが残らないようにするため、メモリリーク防止）
onBeforeUnmount(() => {
  markers.forEach(marker => marker.map = null)
})

// 写真一覧を取得する関数（共有ユーザーも含む）
const fetchPhotos = async () => {
  // 1. 共有ユーザー一覧を取得
  const sharedRes = await fetch(`${API_BASE_URL}/shared-users?uid=${user.value.uid}`);
  const sharedData = await sharedRes.json();
  const sharedUids = sharedData.sharedUids || [];

  // uidごとの色を設定
  sharedUidColorMap.value = getUidColorMap(sharedUids);

  // 2. 自分と共有ユーザーの写真を取得
  const listRes = await fetch(
    `${API_BASE_URL}/list?uid=${user.value.uid}&sharedUids=${sharedUids.join(',')}`
  );
  const listData = await listRes.json();
  // 3. 写真データを整形
  photos.value = listData.photos.map(photo => ({
    ...photo,
    isShared: user.value && photo.uid !== user.value.uid // 自分以外のユーザーがアップロードした写真かどうか
  }));
};

// 初期化処理
onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;
    if (!user.value || !user.value.uid) return;
    await fetchPhotos();

    await waitForGoogleMaps();

    // 地図の初期化とマーカーの表示
    map = new window.google.maps.Map(document.getElementById('map'), {
      center,
      zoom: 15,
      mapId
    });

    markers = photos.value
      .filter(photo => photo.lat && photo.lng)
      .map(photo => {
        const img = document.createElement('img');
        img.src = photo.url;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.borderRadius = '8px';
        img.style.objectFit = 'cover';
        img.style.border =
          photo.isShared
            ? `2px solid ${sharedUidColorMap.value[photo.uid] || '#ff3b30'}`
            : '2px solid #fff';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

        img.addEventListener('click', async () => {
          selectedPhoto.value = photo;
          showModal.value = true;

          // 住所を取得する処理
          photoAddress.value = '住所を取得中...';

          // Reverse Geocodingを使用して住所を取得
          if (photo.lat && photo.lng) {
            try {
              const apiKey = process.env.VUE_APP_GOOGLE_MAP_API_KEY;
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${photo.lat},${photo.lng}&language=ja&key=${apiKey}`
              );
              const data = await res.json();
              if (data.status === 'OK' && data.results.length > 0) {
                photoAddress.value = data.results[0].formatted_address;
              } else {
                photoAddress.value = '住所が見つかりませんでした。';
              }
            } catch (e) {
              photoAddress.value = '住所の取得に失敗しました。';
            }
          } else {
            photoAddress.value = '位置情報なし';
          }
        });

        return new window.google.maps.marker.AdvancedMarkerView({
          map,
          position: { lat: photo.lat, lng: photo.lng },
          content: img
        });
      });
  });
});

// Storageの写真のみ削除する関数
const confirmDeletePhoto = async (event) => {
  event.stopPropagation();
  if (!selectedPhoto.value) return;
  // 削除確認
  if (!window.confirm('本当に削除しますか？')) return;

  try {
    // fileName（Storageのファイルパス）を取得
    const fileName = selectedPhoto.value.fileName || extractFileNameFromUrl(selectedPhoto.value.url);

    const res = await fetch(`${API_BASE_URL}/delete-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '削除に失敗しました。');
      return;
    }
    alert('削除しました。');
    showModal.value = false;
    await fetchPhotos(); // 削除後にリストを更新
    location.reload();
  } catch (e) {
    alert('削除に失敗しました。');
  }
};

// StorageのURLからファイル名を抽出する関数
function extractFileNameFromUrl(url) {
  const match = decodeURIComponent(url).match(/\/o\/(.+)\?/);
  return match ? match[1] : '';
}
</script>

<template>
  <div id="map" style="width: 100%; height: 95vh"></div>
  <div
    v-if="showModal"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-md"
    @click="showModal = false"
  >
    <div
      class="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-6 md:p-10 max-w-3xl w-full mx-4"
      @click.stop
    >
      <img
        :src="selectedPhoto.url"
        class="w-full md:w-[480px] max-w-[80vw] max-h-[60vh] rounded-xl shadow-lg bg-white object-contain"
        alt="사진"
        @click.stop
      />
      <div class="flex flex-col items-start md:ml-8 mt-6 md:mt-0 w-full max-w-xs">
        <div class="mb-4 w-full">
          <div class="text-sm text-gray-500 mb-1">住所</div>
          <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-gray-700 shadow-sm whitespace-pre-line break-words">
            {{ photoAddress }}
          </div>
        </div>
        
        <div class="flex flex-row gap-3 mt-4 w-full justify-end">
          <button
            v-if="selectedPhoto && user && selectedPhoto.uid === user.uid"
            @click.stop="confirmDeletePhoto"
            class="btn"
          >
            Delete
          </button>
          <button
            @click="showModal = false"
            class="btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 写真拡大時のサイズ */
.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.photo-modal-content {
  display: flex;
  align-items: center;
  justify-content: center;

}

.photo-modal-img {
  max-width: 60vw;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  background: #fff;
}

.photo-modal-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 28px;
  min-width: 180px;
  max-width: 320px;
}

.photo-modal-address {
  color: #fff;
  background: rgba(0,0,0,0.5);
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 18px;
  word-break: break-all;
}

.photo-delete-btn {
  background: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: bold;
}

.btn {
  @apply px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed border-2 border-blue-300;
}
.btn-outline {
  @apply px-6 py-2 rounded-lg border-2 border-blue-400 text-blue-600 font-semibold bg-white hover:bg-blue-50 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed;
}
</style>