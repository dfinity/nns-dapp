<script lang="ts">
  import { onMount } from "svelte";
  import Layout from "../lib/components/common/Layout.svelte";
  import ProjectInfoSection from "../lib/components/sns-project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "../lib/components/sns-project-detail/ProjectStatusSection.svelte";
  import TwoColumns from "../lib/components/ui/TwoColumns.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.SNSLaunchpad,
    });
</script>

<Layout on:nnsBack={goBack} layout="detail">
  <svelte:fragment slot="header">Project Tetris</svelte:fragment>
  <section>
    <TwoColumns>
      <ProjectInfoSection slot="left" />
      <ProjectStatusSection slot="right" />
    </TwoColumns>
  </section>
</Layout>

<style lang="scss">
  @use "../lib/themes/mixins/media";
  section {
    box-sizing: border-box;
    min-height: 100%;

    display: flex;
    align-items: stretch;
  }
</style>
