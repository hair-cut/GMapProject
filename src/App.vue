<template>
  <div id="app">
    <router-view></router-view> <!-- 라우터 뷰를 통해 Home.vue가 로딩됨 -->
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>