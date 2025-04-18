<script setup>
import LeftMenu from "./components/LeftMenu.vue";
import { RouterView } from "vue-router";
import { KeepAlive, onMounted } from "vue";
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  }
})

</script>

<template>
  <div class="min-h-screen flex flex-row font-[MiSans-Normal]">
    <LeftMenu class="!sticky top-0 left-0" />
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <!-- <img src="../src/assets/bg.png" class="h-full w-full object-cover object-top z-[-1] fixed left-0 opacity-30"></img> -->
  </div>
</template>
