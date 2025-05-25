<template>
  <header class="navbar">
    <div class="nav-left">
      <button class="nav-button" :disabled="!user" @click="triggerFileInput">写真アップロード</button>
      <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" />
      <button class="nav-button" v-if="user" @click="logout">ログアウト</button>
      <span v-if="user" class="user-email">{{ user.email }}</span>
      <button class="nav-button" v-else @click="goToLogin">ログイン</button>
    </div>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import EXIF from 'exif-js';

export default {
  name: "AppMenu",
  setup() {
    const user = ref(null);
    const fileInput = ref(null);

    const triggerFileInput = () => {
      if (fileInput.value) fileInput.value.click();
    };

    // EXIFで 位置情報を取得する関数
    function getLatLngFromExif(file) {
      return new Promise((resolve) => {
        EXIF.getData(file, function () {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lng = EXIF.getTag(this, "GPSLongitude");
          const lngRef = EXIF.getTag(this, "GPSLongitudeRef");

          if (lat && lng && latRef && lngRef) {
            // 緯度と経度を度に変換する関数
            const toDecimal = (dms, ref) => {
              const [d, m, s] = dms;
              let dec = d + m / 60 + s / 3600;
              if (ref === "S" || ref === "W") dec = -dec;
              return dec;
            };
            resolve({
              lat: toDecimal(lat, latRef),
              lng: toDecimal(lng, lngRef)
            });
          } else {
            resolve({ lat: '', lng: '' }); // 位置情報がない場合は空文字を返す
          }
        });
      });
    }

    // ファイル選択時の処理
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file || !user.value) return;

      // EXIFから位置情報を取得
      const { lat, lng } = await getLatLngFromExif(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', user.value.uid);
      formData.append('lat', lat);
      formData.append('lng', lng);

      try {
        const response = await fetch('http://localhost:3001/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('アップロード失敗');
        const result = await response.json();
        alert('アップロード成功!\nファイル名: ' + result.fileName);
      } catch (error) {
        alert('アップロード失敗: ' + error.message);
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
      });
    });

    const goToLogin = () => {
      window.location.href = '/login';
    };

    const logout = async () => {
      try {
        await signOut(auth);
        user.value = null;
      } catch (error) {
        alert('ログアウトに失敗しました。');
      }
    };

    return {
      user,
      goToLogin,
      logout,
      handleFileChange,
      triggerFileInput,
      fileInput
    };
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  background-color: #333;
  padding: 0.5rem 1rem;
  color: white;
}

.nav-left {
  display: flex;
  gap: 10px;
}

.nav-button {
  background-color: #ff3b30;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.nav-button:hover {
  background-color: #cc2d26;
}

.nav-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>