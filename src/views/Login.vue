<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-pink-50 to-green-50">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
      <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">ログイン</h2>
      <form @submit.prevent="login" class="space-y-4">
        <input
          type="email"
          v-model="email"
          placeholder="メールアドレス"
          class="w-full px-4 py-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
        />
        <input
          type="password"
          v-model="password"
          placeholder="パスワード"
          class="w-full px-4 py-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
        />
        <button
          class="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
          type="submit"
        >
          ログイン
        </button>
      </form>
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
      <p class="mt-6 text-center text-gray-600">
        アカウントをお持ちでない方はこちら：
        <button
          @click="goToSignup"
          class="text-blue-600 hover:underline font-semibold ml-1"
        >新規登録</button>
      </p>
    </div>
  </div>
</template>

<script>
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push('/'); 
      } catch (error) {
        this.errorMessage = 'ログインに失敗しました。メールアドレスとパスワードをご確認ください。';
        console.error(error);
      }
    },
    goToSignup() {
      this.$router.push('/signup');
    },
  }
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, var(--tw-gradient-stops));
}
.from-blue-50 {
  --tw-gradient-from: #eff6ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(239, 246, 255, 0));
}
.via-pink-50 {
  --tw-gradient-from: #f9e6ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(249, 230, 255, 0));
}
.to-green-50 {
  --tw-gradient-from: #f0fdf4;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(240, 253, 244, 0));
}
.w-full {
  width: 100%;
}
.max-w-md {
  max-width: 28rem;
}
.bg-white {
  background-color: #fff;
}
.rounded-2xl {
  border-radius: 1rem;
}
.shadow-2xl {
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}
.border-2 {
  border-width: 2px;
}
.border-blue-100 {
  --tw-border-opacity: 1;
  border-color: rgba(191, 219, 254, var(--tw-border-opacity));
}
.p-8 {
  padding: 2rem;
}
.text-2xl {
  font-size: 1.5rem;
}
.font-bold {
  font-weight: 700;
}
.text-blue-700 {
  color: #1e40af;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.text-center {
  text-align: center;
}
.space-y-4 > * + * {
  margin-top: 1rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.border-2 {
  border-width: 2px;
}
.border-blue-100 {
  --tw-border-opacity: 1;
  border-color: rgba(191, 219, 254, var(--tw-border-opacity));
}
.rounded-lg {
  border-radius: 0.5rem;
}
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus\:ring-2:focus {
  ring-width: 2px;
}
.focus\:ring-blue-300:focus {
  --tw-ring-color: rgb(147 197 253 / 0.5);
  ring-color: rgb(147 197 253 / 0.5);
}
.bg-blue-50 {
  background-color: #eff6ff;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.bg-blue-500 {
  background-color: #3b82f6;
}
.text-white {
  color: #fff;
}
.font-semibold {
  font-weight: 600;
}
.shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.hover\:bg-blue-600:hover {
  background-color: #2563eb;
}
.transition {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.text-red-500 {
  color: #dc2626;
}
.mt-4 {
  margin-top: 1rem;
}
.mt-6 {
  margin-top: 1.5rem;
}
.text-gray-600 {
  color: #4b5563;
}
.hover\:underline:hover {
  text-decoration: underline;
}
.ml-1 {
  margin-left: 0.25rem;
}
</style>
