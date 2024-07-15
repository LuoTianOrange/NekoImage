<script>
import LeftMenu from "./components/LeftMenu.vue";
import { RouterView } from "vue-router";
import { KeepAlive } from "vue";

export default {
  name: "App",
  components: {
    LeftMenu,
    RouterView,
    KeepAlive,
  },
};
</script>

<template>
  <div class="min-h-screen flex flex-row font-[MiSans-Normal]">
    <LeftMenu />
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>
