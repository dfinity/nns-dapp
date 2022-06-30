<script lang="ts">
  import { onMount } from "svelte";
  import ProjectInfoSection from "../lib/components/sns-project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "../lib/components/sns-project-detail/ProjectStatusSection.svelte";
  import TwoColumns from "../lib/components/ui/TwoColumns.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import {
    layoutBackStore,
    layoutTitleStore,
  } from "../lib/stores/layout.store";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import {
    loadSnsFullProject,
    routePathRootCanisterId,
  } from "../lib/services/sns.services";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    type SnsFullProject,
    snsFullProjectStore,
  } from "../lib/stores/snsProjects.store";
  import { getSnsProjectById } from "../lib/utils/sns.utils";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  let rootCanisterIdString: string | undefined;
  let fullProject: SnsFullProject | undefined;
  $: fullProject = getSnsProjectById({
    id: rootCanisterIdString,
    projects: $snsFullProjectStore,
  });
  $: {
    console.log("fullProject", fullProject);
  }

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (!isRoutePath({ path: AppPath.SNSProjectDetail, routePath: path })) {
      return;
    }
    const rootCanisterIdMaybe = routePathRootCanisterId(path);
    if (rootCanisterIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.Neurons });
      return;
    }
    rootCanisterIdString = rootCanisterIdMaybe;

    await loadSnsFullProject(rootCanisterIdString);
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.SNSLaunchpad,
    });

  layoutBackStore.set(goBack);

  layoutTitleStore.set("Project Tetris");
</script>

<MainContentWrapper sns>
  <div class="stretch-mobile">
    <TwoColumns>
      <ProjectInfoSection slot="left" />
      <ProjectStatusSection slot="right" />
    </TwoColumns>
  </div>
</MainContentWrapper>

<style lang="scss">
  @use "../lib/themes/mixins/media";
  .stretch-mobile {
    min-height: 100%;

    display: flex;
    align-items: stretch;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
