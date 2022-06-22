<script lang="ts">
  import { onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import ProjectInfoSection from "../lib/components/sns-project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "../lib/components/sns-project-detail/ProjectStatusSection.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });
</script>

<HeadlessLayout>
  <svelte:fragment slot="header">Project Tetris</svelte:fragment>
  <section data-tid="sns-project-detail">
    <ProjectInfoSection />
    <ProjectStatusSection />
  </section>
</HeadlessLayout>

<style lang="scss">
  @use "../lib/themes/mixins/media";
  section {
    display: flex;
    flex-direction: column;

    @include media.min-width(large) {
      flex-direction: row;
    }
  }
</style>
