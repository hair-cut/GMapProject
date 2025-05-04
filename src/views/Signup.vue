<template>
    <div class="signup-container">
      <h2>新規登録</h2>
      <input type="text" placeholder="ID" />
      <input type="email" placeholder="メールアドレス" />
      <input type="password" placeholder="パスワード" />
      <button class="signup-button">登録する</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SignupPage'
  }
  </script>
  
  <style scoped>
  .signup-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 1em;
    border: 1px solid #ccc;
    border-radius: 10px;
  }
  .signup-container input {
    display: block;
    width: 100%;
    margin-bottom: 1em;
    padding: 0.5em;
  }
  .signup-button {
    width: 100%;
    padding: 0.5em;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
  }
  </style>
  