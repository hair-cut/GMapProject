<template>
  <div class="login-container">
    <h2>ログイン</h2>
    <input type="text" placeholder="ID" />
    <input type="password" placeholder="パスワード" />
    <button class="login-button">ログイン</button>
    <p>
      アカウントをお持ちでない方はこちら：
      <button @click="goToSignup">新規登録</button>
    </p>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  methods: {
    goToSignup() {
      this.$router.push('/signup');
    }
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
}
.login-container input {
  display: block;
  width: 100%;
  margin-bottom: 1em;
  padding: 0.5em;
}
.login-button {
  width: 100%;
  padding: 0.5em;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
}
</style>
