<template>
  <header class="navbar">
    <div class="nav-left">
      <button class="nav-button" :disabled="!user" @click="triggerFileInput">写真アップロード</button>
      <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" />
      <button class="nav-button" v-if="user" @click="logout">ログアウト</button>
      <span v-if="user" class="user-email">{{ user.email }}</span>
      <button class="nav-button" v-else @click="goToLogin">ログイン</button>
    </div>
    <div class="nav-right">
      <button class="nav-button" :disabled="!user" @click="openShareModal">写真共有</button>
    </div>
  </header>

  <!-- 写真共有要請 + 承認済み共有アカウント一覧 -->
  <div v-if="showShareModal" class="modal-overlay" @click.self="closeShareModal">
    <div class="modal-row">
      <!-- 写真共有要請  -->
      <div class="share-modal">
        <h3>写真共有要請</h3>
        <input v-model="shareTarget" type="email" placeholder="共有する相手のメールを入力してください。" class="share-input" />
        <div class="share-modal-actions">
          <button class="nav-button" @click="sendShareRequest">共有リクエスト送信</button>
          <button class="nav-button" @click="showShareHistory">承認済みアカウント一覧</button>
          <button class="nav-button" @click="openRequestModal">共有リクエスト受信一覧</button> <!-- 추가 -->
          <button class="nav-button" @click="closeShareModal">閉じる</button>
        </div>
      </div>
      <!-- 承認済み共有アカウント一覧 -->
      <div v-if="showHistoryModal" class="share-modal history-modal">
        <h3>承認済みの共有アカウント一覧</h3>
        <ul v-if="sharedEmails.length > 0">
          <li v-for="email in sharedEmails" :key="email.email" style="margin-bottom: 1rem;">
            <span :style="{ color: colorList[email.colorIdx], fontWeight: 'bold', marginRight: '12px' }">
              {{ email.email }}
            </span>
            <button
              class="nav-button"
              style="background: #aaa; margin-left: 8px;"
              @click="confirmStopShare(email.email)"
            >共有中止</button>
          </li>
        </ul>
        <div v-else>共有したアカウントがありません。</div>
        <button class="nav-button" @click="closeHistoryModal">閉じる</button>
      </div>
    </div>
  </div>

  <!-- 공유요청수신목록 모달 -->
  <div v-if="showRequestModal" class="modal-overlay" @click.self="closeRequestModal">
    <div class="share-modal history-modal">
      <h3>共有リクエスト受信一覧</h3>
      <ul v-if="pendingList.length > 0">
        <li v-for="item in pendingList" :key="item.requestId" style="margin-bottom: 1rem; display: flex; align-items: center;">
          <span style="font-weight: bold; margin-right: 12px;">{{ item.fromEmail }}</span>
          <button class="nav-button" style="margin-right: 8px;" @click="respondShareRequest(item.requestId, true)">承認</button>
          <button class="nav-button" style="background: #aaa;" @click="respondShareRequest(item.requestId, false)">拒否</button>
        </li>
      </ul>
      <div v-else>受信した共有リクエストはありません。</div>
      <button class="nav-button" @click="closeRequestModal">閉じる</button>
    </div>
  </div>
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

    const showShareModal = ref(false);
    const shareTarget = ref('');

    const showHistoryModal = ref(false);
    const sharedEmails = ref([]); // [{ email, colorIdx }]
    const colorList = [
      '#ff3b30', '#ff9500', '#ffcc00', '#4cd964',
      '#5ac8fa', '#007aff', '#5856d6', '#ff2d55',
    ];

    const showRequestModal = ref(false);
    const pendingList = ref([]);

    const openShareModal = () => {
      showShareModal.value = true;
      shareTarget.value = '';
    };
    const closeShareModal = () => {
      showShareModal.value = false;
      showHistoryModal.value = false;
    };

    // 承認済み共有アカウントのメールアドレス一覧を取得
    const fetchSharedEmails = async () => {
      sharedEmails.value = [];
      try {
        const res = await fetch(`http://localhost:3001/shared-users?uid=${user.value.uid}`);
        const data = await res.json();
        const sharedUids = data.sharedUids || [];
        let idx = 0;
        for (const uid of sharedUids) {
          try {
            const userRes = await fetch(`http://localhost:3001/user-email?uid=${uid}`);
            const userData = await userRes.json();
            if (userData.email) {
              sharedEmails.value.push({ email: userData.email, colorIdx: idx % colorList.length });
              idx++;
            }
          } catch (e) {
            // 에러 무시
          }
        }
      } catch (e) {
        alert('共有中のアカウント取得に失敗しました');
      }
    };

    // 承認済み共有アカウント一覧を表示
    const showShareHistory = async () => {
      showHistoryModal.value = true;
      await fetchSharedEmails();
    };
    const closeHistoryModal = () => {
      showHistoryModal.value = false;
    };

    // 共有リクエスト送信
    const sendShareRequest = async () => {
      if (!shareTarget.value) {
        alert('共有する相手のメールアドレスを入力してください。');
        return;
      }

      // メールアドレス形式のチェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shareTarget.value)) {
        alert('メールアドレスの形式が正しくありません。');
        return;
      }
      try {
        const res = await fetch('http://localhost:3001/share-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetEmail: shareTarget.value,
            fromUid: user.value.uid
          })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'リクエスト送信に失敗しました');
          return;
        }
        alert('リクエスト送信が完了しました');
        closeShareModal();
      } catch (e) {
        alert('エラーが発生しました: ' + (e.message || e));
      }
    };

    const triggerFileInput = () => {
      if (fileInput.value) fileInput.value.click();
    };

    // EXIFから位置情報を取得する関数
    function getLatLngFromExif(file) {
      return new Promise((resolve) => {
        EXIF.getData(file, function () {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lng = EXIF.getTag(this, "GPSLongitude");
          const lngRef = EXIF.getTag(this, "GPSLongitudeRef");

          if (lat && lng && latRef && lngRef) {
            // 緯度・経度を度に変換する関数
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

      // 位置情報がない場合はアップロード不可
      if (!lat || !lng) {
        alert('位置情報がない写真はアップロードできません。');
        return;
      }

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
        if (!response.ok) throw new Error('アップロードに失敗しました');
        const result = await response.json();
        alert('アップロード成功!\nファイル名: ' + result.fileName);
      } catch (error) {
        alert('アップロードに失敗しました: ' + error.message);
      }
    };

    // 共有リクエスト受信一覧を開く
    const openRequestModal = async () => {
      showRequestModal.value = true;
      await fetchPendingRequests();
    };
    const closeRequestModal = () => {
      showRequestModal.value = false;
    };

    // 共有リクエスト受信一覧を取得
    const fetchPendingRequests = async () => {
      pendingList.value = [];
      try {
        const res = await fetch(`http://localhost:3001/share-requests?uid=${user.value.uid}`);
        const data = await res.json();
        (data.requests || []).forEach(req => {
          pendingList.value.push({
            requestId: req.id,
            fromEmail: req.fromEmail
          });
        });
      } catch (e) {
        alert('共有リクエストの取得に失敗しました');
      }
    };

    // 承認と拒否
    const respondShareRequest = async (requestId, accept) => {
      if (!window.confirm(accept ? '本当に承認しますか？' : '本当に拒否しますか？')) return;
      try {
        const res = await fetch('http://localhost:3001/share-request/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, accept })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || '操作に失敗しました');
          return;
        }
        await fetchPendingRequests();
      } catch (e) {
        alert('操作に失敗しました');
      }
    };

    // 共有中止の確認
    const confirmStopShare = async (targetEmail) => {
      if (!window.confirm('本当に共有を中止しますか？')) return;
      try {
        const res = await fetch('http://localhost:3001/stop-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.value.uid,
            targetEmail
          })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || '共有中止に失敗しました。');
          return;
        }
        alert('共有を中止しました。');
        await fetchSharedEmails(); 
      } catch (e) {
        alert('共有中止に失敗しました。');
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
        window.location.reload();
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
      fileInput,
      showShareModal,
      shareTarget,
      openShareModal,
      closeShareModal,
      sendShareRequest,
      showShareHistory,
      showHistoryModal,
      closeHistoryModal,
      sharedEmails,
      showRequestModal,
      openRequestModal,
      closeRequestModal,
      pendingList,
      respondShareRequest,
      colorList,
      confirmStopShare,
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
  justify-content: space-between;
}

/* 左側のナビゲーション */
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

/* 写真共有ポップアップ中央配置 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 写真共有要請と共有リクエスト履歴を横並びに配置 */
.modal-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
}

/* .share-modalの基本スタイル、history-modalにはmin-widthを追加 */
.share-modal {
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.history-modal {
  min-width: 340px;
}

.share-input {
  margin-bottom: 1.2rem;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.share-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>