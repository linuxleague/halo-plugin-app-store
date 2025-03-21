<script lang="ts" setup>
import type { Plugin, Theme } from "@halo-dev/api-client";
import AppDetailModal from "./AppDetailModal.vue";
import { nextTick, ref, toRefs } from "vue";
import { usePluginVersion } from "@/composables/use-plugin-version";
import { useAppDownload } from "@/composables/use-app-download";
import RiArrowUpCircleLine from "~icons/ri/arrow-up-circle-line";
import { useThemeVersion } from "@/composables/use-theme-version";
import { useAppCompare } from "@/composables/use-app-compare";

const props = withDefaults(
  defineProps<{
    plugin?: Plugin;
    theme?: Theme;
  }>(),
  {
    plugin: undefined,
    theme: undefined,
  }
);

const { plugin, theme } = toRefs(props);

function useVersion() {
  if (props.plugin) {
    return usePluginVersion(plugin);
  }

  if (props.theme) {
    return useThemeVersion(theme);
  }

  return {
    hasUpdate: false,
    matchedApp: ref(),
  };
}

const { hasUpdate, matchedApp } = useVersion();
const { isSatisfies } = useAppCompare(matchedApp);
const { upgrading, handleUpgrade } = useAppDownload(matchedApp);

const detailModal = ref(false);
const detailModalVisible = ref(false);

function handleOpenDetailModal() {
  detailModal.value = true;
  nextTick(() => {
    detailModalVisible.value = true;
  });
}

function onDetailModalClose() {
  detailModalVisible.value = false;
  setTimeout(() => {
    detailModal.value = false;
  }, 200);
}
</script>

<template>
  <template v-if="hasUpdate">
    <div v-if="upgrading" class="as-inline-flex as-items-center as-gap-1">
      <svg class="as-h-4 as-w-4 as-animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="as-opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        ></path>
      </svg>
      <span class="as-truncate as-text-xs as-text-gray-500"> 更新中 </span>
    </div>
    <div v-else class="as-inline-flex as-items-center as-gap-1">
      <RiArrowUpCircleLine class="as-h-4 as-w-4 as-text-green-500" />
      <div v-if="isSatisfies" class="as-truncate as-text-xs as-text-gray-500">
        有新版本，<span
          class="as-cursor-pointer as-text-gray-900 hover:as-text-gray-600"
          @click="handleOpenDetailModal"
        >
          查看详情
        </span>
        或
        <span class="as-cursor-pointer as-text-gray-900 hover:as-text-gray-600" @click="handleUpgrade()">
          立即更新
        </span>
      </div>
      <div v-else class="as-truncate as-text-xs as-text-gray-500">
        有新版本，<span class="as-cursor-pointer as-text-gray-900 hover:as-text-gray-600" @click="handleOpenDetailModal"
          >版本不兼容
        </span>
      </div>
    </div>
  </template>

  <AppDetailModal
    v-if="detailModal"
    v-model:visible="detailModalVisible"
    :app="matchedApp"
    tab="releases"
    @close="onDetailModalClose"
  />
</template>
