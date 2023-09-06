import type { ApplicationSearchResult, ListResponse } from "@/types";
import storeApiClient from "@/utils/store-api-client";
import type { Theme } from "@halo-dev/api-client";
import { useQuery } from "@tanstack/vue-query";
import { computed, type Ref } from "vue";
import semver from "semver";
import { useHaloVersion } from "./use-halo-version";
import { STORE_APP_ID } from "@/constant";

export function useThemeVersion(theme: Ref<Theme | undefined>) {
  const { haloVersion } = useHaloVersion();

  // TODO: 可能需要专门的最新版本应用列表接口
  const { data: storeThemes } = useQuery<ListResponse<ApplicationSearchResult>>({
    queryKey: ["theme-apps"],
    queryFn: async () => {
      const { data } = await storeApiClient.get<ListResponse<ApplicationSearchResult>>(
        `/apis/api.store.halo.run/v1alpha1/applications`,
        {
          params: {
            type: "THEME",
          },
        }
      );
      return data;
    },
    staleTime: 1000,
  });

  const matchedApp = computed(() => {
    return storeThemes.value?.items.find(
      (app) => app.application.metadata.name === theme.value?.metadata.annotations?.[STORE_APP_ID]
    );
  });

  const hasUpdate = computed(() => {
    if (!theme.value) {
      return false;
    }

    if (!matchedApp.value?.latestRelease) {
      return false;
    }

    const { version } = matchedApp.value.latestRelease.spec;

    if (!version) {
      return false;
    }

    return semver.lt(theme.value?.spec.version, version);
  });

  const isSatisfies = computed(() => {
    if (!matchedApp.value?.latestRelease) {
      return false;
    }
    const { requires } = matchedApp.value.latestRelease.spec;

    if (!haloVersion.value || !requires) {
      return false;
    }

    return semver.satisfies(haloVersion.value, requires, { includePrerelease: true });
  });

  return { hasUpdate, isSatisfies, matchedApp };
}
