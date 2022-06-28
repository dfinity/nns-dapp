<script lang="ts">
  import { onMount } from "svelte";
  import ProjectInfoSection from "../lib/components/sns-project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "../lib/components/sns-project-detail/ProjectStatusSection.svelte";
  import TwoColumns from "../lib/components/ui/TwoColumns.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import {layoutBackStore, layoutTitleStore} from '../lib/stores/layout.store';

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.SNSLaunchpad,
    });

  layoutBackStore.set(goBack);

  layoutTitleStore.set('Project Tetris');
</script>

<section>
  <TwoColumns>
    <ProjectInfoSection slot="left" />
    <ProjectStatusSection slot="right" />
  </TwoColumns>
</section>

<style lang="scss">
  @use "../lib/themes/mixins/media";
  section {
    box-sizing: border-box;
    min-height: 100%;
    padding: var(--padding-2x) var(--padding);

    display: flex;
    align-items: stretch;

    @include media.min-width(medium) {
      padding: var(--padding-2x) var(--padding-2_5x);
    }
  }
</style>
