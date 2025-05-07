<template>
  <div class="signup-container">
    <h2>新規登録</h2>
    <input type="email" v-model="email" placeholder="メールアドレス" />
    <input type="password" v-model="password" placeholder="パスワード" />

    <button class="signup-button" @click="signup">登録する</button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>

  </div>
</template>

<script>
import { ref } from 'vue';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'SignupPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const router = useRouter();

    const signup = async () => {
      errorMessage.value = '';
      successMessage.value = '';

      // firebaseは8桁以下のパスワードに対してエラーを出すので8桁以上のパスワードにする
      if (password.value.length < 8) {
        errorMessage.value = 'パスワードは8文字以上で入力してください。';
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        successMessage.value = '登録に成功しました！';
        router.push('/');
      } catch (error) {
        errorMessage.value = 'エラー：' + error.message;
      }
    };

    return { email, password, signup, errorMessage, successMessage };
  }
};
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

.error {
  color: red;
}

.success {
  color: green;
}
</style>
