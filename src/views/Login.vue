<template>
  <div class="login-container">
    <h2>ログイン</h2>
    <input type="email" v-model="email" placeholder="メールアドレス" />
    <input type="password" v-model="password" placeholder="パスワード" />
    <button class="login-button" @click="login">ログイン</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p>
      アカウントをお持ちでない方はこちら：
      <button @click="goToSignup">新規登録</button>
    </p>
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
        this.$router.push('/'); // ログイン成功時にHomeへ移動
      } catch (error) {
        this.errorMessage = 'ログインに失敗しました。メールアドレスとパスワードをご確認ください。';
        console.error(error); // ログ確認
      }
    },
    goToSignup() {
      this.$router.push('/signup');
    },
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}
.login-container input {
  display: block;
  width: 100%;
  margin-bottom: 1em;
  padding: 0.5em;
  font-size: 1em;
}
.login-button {
  width: 100%;
  padding: 0.5em;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}
.login-button:hover {
  background-color: #45a049;
}
.error-message {
  color: red;
  margin-bottom: 1em;
}
</style>
