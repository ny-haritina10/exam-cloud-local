<template>
  <div class="d-flex">
    <Sidebar class="sidebar-container" />
    <main class="content-container">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import Sidebar from "@/components/Panel/Sidebar.vue";

export default {
  components: { Sidebar },
};
</script>

<style scoped>
.sidebar-container {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.content-container {
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
}
</style>