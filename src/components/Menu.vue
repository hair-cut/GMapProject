<template>
  <header class="bg-white shadow flex items-center justify-between px-6 py-3 border-b border-blue-100">
    <div class="flex items-center gap-3">
      <button class="btn" :disabled="!user" @click="triggerFileInput">写真アップロード</button>
      <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />
      <button class="btn" v-if="user" @click="logout">Logout</button>
      <span v-if="user" class="ml-2 text-gray-700 font-medium">{{ user.email }}</span>
      <button class="btn-outline" v-else @click="goToLogin">Login</button>
    </div>
    <div>
      <button class="btn" :disabled="!user" @click="openShareModal">写真共有</button>
    </div>
  </header>

  <!-- 写真共有要請 + 承認済み共有アカウント一覧 -->
  <div
    v-if="showShareModal"
    class="fixed inset-0 bg-white bg-opacity-10 flex items-center justify-center z-50 backdrop-blur-md"
  >
    <div class="flex flex-col md:flex-row gap-8">
      <!-- 写真共有要請  -->
      <div class="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-8 min-w-[320px] flex flex-col">
        <h3 class="text-lg font-bold mb-4 text-blue-700">写真共有要請</h3>
        <input
          v-model="shareTarget"
          type="email"
          placeholder="共有する相手のメールを入力してください。"
          class="mb-4 px-3 py-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
        />
        <div class="flex gap-2 justify-end">
          <button class="btn" @click="sendShareRequest">共有リクエスト送信</button>
          <button class="btn-outline" @click="showShareHistory">承認済みアカウント一覧</button>
          <button class="btn-outline" @click="openRequestModal">共有リクエスト受信一覧</button>
          <button class="btn-outline" @click="closeShareModal">閉じる</button>
        </div>
      </div>
      <!-- 承認済み共有アカウント一覧 -->
      <div
        v-if="showHistoryModal"
        class="fixed inset-0 bg-white bg-opacity-10 flex items-center justify-center z-50 backdrop-blur-md"
      >
        <div class="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-8 min-w-[340px] flex flex-col">
          <h3 class="text-lg font-bold mb-4 text-green-700">承認済みの共有アカウント一覧</h3>
          <ul v-if="sharedEmails.length > 0" class="space-y-3">
            <li v-for="email in sharedEmails" :key="email.email" class="flex items-center justify-between">
              <span :style="{ color: colorList[email.colorIdx] }" class="font-semibold">
                {{ email.email }}
              </span>
              <button
                class="btn-outline"
                @click="confirmStopShare(email.email)"
              >共有中止</button>
            </li>
          </ul>
          <div v-else class="text-gray-400 mt-4">共有したアカウントがありません。</div>
          <button class="btn mt-6" @click="closeHistoryModal">閉じる</button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showRequestModal"
    class="fixed inset-0 bg-white bg-opacity-10 flex items-center justify-center z-50 backdrop-blur-md"
  >
    <div class="bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 p-8 min-w-[340px]">
      <h3 class="text-lg font-bold mb-4 text-yellow-700">共有リクエスト受信一覧</h3>
      <ul v-if="pendingList.length > 0" class="space-y-3">
        <li v-for="item in pendingList" :key="item.requestId" class="flex items-center justify-between">
          <span class="font-semibold">{{ item.fromEmail }}</span>
          <div class="flex gap-2">
            <button class="btn" @click="respondShareRequest(item.requestId, true)">承認</button>
            <button class="btn-outline" @click="respondShareRequest(item.requestId, false)">拒否</button>
          </div>
        </li>
      </ul>
      <div v-else class="text-gray-400 mt-4">受信した共有リクエストはありません。</div>
      <button class="btn mt-6" @click="closeRequestModal">閉じる</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import EXIF from 'exif-js';
import { useRouter } from 'vue-router'; //gitpages 404ERROR

export default {
  name: "AppMenu",
  setup() {
    // 環境によりAPIのベースURLを設定
    const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

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

    const router = useRouter();

    // 承認済み共有アカウントのメールアドレス一覧を取得
    const fetchSharedEmails = async () => {
      sharedEmails.value = [];
      try {
        const res = await fetch(`${API_BASE_URL}/shared-users?uid=${user.value.uid}`);
        const data = await res.json();
        const sharedUids = data.sharedUids || [];
        let idx = 0;
        for (const uid of sharedUids) {
          try {
            const userRes = await fetch(`${API_BASE_URL}/user-email?uid=${uid}`);
            const userData = await userRes.json();
            if (userData.email) {
              sharedEmails.value.push({ email: userData.email, colorIdx: idx % colorList.length });
              idx++;
            }
          } catch (e) {
            // 空白
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
        const res = await fetch(`${API_BASE_URL}/share-request`, {
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
        const response = await fetch(`${API_BASE_URL}/upload`, {
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
        const res = await fetch(`${API_BASE_URL}/share-requests?uid=${user.value.uid}`);
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
        const res = await fetch(`${API_BASE_URL}/share-request/respond`, {
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
        const res = await fetch(`${API_BASE_URL}/stop-share`, {
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
      router.push('/login'); 
      // this.$router.push('/login');
      // createWebHashHistoryへの変更による変更
      // window.location.href = '/login';
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
.btn {
  @apply px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed border-2 border-blue-300;
}
.btn-outline {
  @apply px-4 py-2 rounded-lg border-2 border-blue-400 text-blue-600 font-semibold bg-white hover:bg-blue-50 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed;
}
</style>