<template>
  <header class="navbar">
    <div class="nav-left">
      <!-- ログイン有無による写真アップロード活性化状態 -->
      <button class="nav-button" :disabled="!user" @click="triggerFileInput">写真アップロード</button>
      <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" />

      <!-- ログイン有無によるボタン表記 -->
      <button class="nav-button" v-if="user" @click="logout">ログアウト</button>

      <!-- ログインしている場合にのみ表示されるユーザーのメール -->
      <span v-if="user" class="user-email">{{ user.email }}</span>

      <button class="nav-button" v-else @click="goToLogin">ログイン</button>
    </div>
  </header>
</template>

<script>
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, storage, firestore } from '../firebase';
import { ref, onMounted } from 'vue';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore'; // ← firestore로 수정
import EXIF from 'exif-js';

export default {
  name: "AppMenu",
  setup() {
    const user = ref(null);
    const fileInput = ref(null);
    const uploadMessage = ref('');

    // ログイン状態監視
    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
      });
    });

    // ログインページへ移動
    const goToLogin = () => {
      window.location.href = '/login';
    };

    // ログアウト
    const logout = async () => {
      try {
        await signOut(auth);
        user.value = null;
      } catch (error) {
        console.error('ログアウトに失敗しました:', error);
      }
    };

    // ファイル選択ポップアップ
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    // DMS → 소수점 변환 함수
    const dmsToDecimal = (dms, ref) => {
      const degrees = dms[0];
      const minutes = dms[1];
      const seconds = dms[2];
      let decimal = degrees + minutes / 60 + seconds / 3600;
      if (ref === 'S' || ref === 'W') {
        decimal *= -1;
      }
      return decimal;
    };

    // EXIFから位置情報を抽出
    const extractExifLocation = (file) => {
      return new Promise((resolve) => {
        EXIF.getData(file, function () {
          const lat = EXIF.getTag(this, 'GPSLatitude');
          const lon = EXIF.getTag(this, 'GPSLongitude');
          const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
          const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');

          if (lat && lon && latRef && lonRef) {
            const latitude = dmsToDecimal(lat, latRef);
            const longitude = dmsToDecimal(lon, lonRef);
            if (isNaN(latitude) || isNaN(longitude)) {
              resolve(null);
            } else {
              resolve({ lat: latitude, lon: longitude });
            }
          } else {
            resolve(null); // 위치 정보 없음
          }
        });
      });
    };

    // ファイル選択後のアップロード処理
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file || !user.value) return;

      try {
        // EXIFデータから位置情報を取得
        const location = await extractExifLocation(file);
        if (!location || location.lat == null || location.lon == null) {
          uploadMessage.value = 'アップロード失敗: 位置情報がありません。GPS情報のある写真をアップロードしてください。';
          alert(uploadMessage.value);
          return;
        }

        const filePath = `uploads/${user.value.uid}/${file.name}`;
        const fileRef = storageRef(storage, filePath);

        // Firebase Storage にアップロード
        await uploadBytes(fileRef, file);
        const fileURL = await getDownloadURL(fileRef);

        // Firestore に画像情報と位置情報を保存
        const imageData = {
          url: fileURL,
          lat: location.lat,
          lng: location.lon,
          userId: user.value.uid,
          timestamp: new Date()
        };

        await setDoc(doc(firestore, 'images', `${user.value.uid}_${file.name}`), imageData);

        uploadMessage.value = 'アップロード成功！';
        alert(uploadMessage.value);
      } catch (error) {
        console.error('アップロードエラー:', error);
        uploadMessage.value = 'アップロード失敗';
        alert(uploadMessage.value);
      }
    };

    return {
      user,
      goToLogin,
      logout,
      triggerFileInput,
      handleFileChange,
      fileInput,
      uploadMessage
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
