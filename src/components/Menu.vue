<template>
  <header class="navbar">
    <div class="nav-left">
      <button class="nav-button">写真アップロード</button>
      <button @click="goToSignup">Login</button>
    </div>
  </header>
</template>

<script>
export default {
  name: "AppMenu",
  methods: {
    goToSignup() {
      this.$router.push('../login');
    }
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
</style>