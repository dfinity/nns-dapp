<script lang="ts">
  import { onMount } from "svelte";
  import Projects from "../lib/components/sns-launchpad/Projects.svelte";
  import Proposals from "../lib/components/sns-launchpad/Proposals.svelte";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });
</script>

<MainContentWrapper sns>
  <h2>{$i18n.sns_launchpad.projects}</h2>
  <Projects />

  <h2>{$i18n.sns_launchpad.proposals}</h2>
  <Proposals />
</MainContentWrapper>

<style lang="scss">
  h2 {
    margin: var(--padding-8x) 0 var(--padding-3x);

    &:first-of-type {
      margin-top: var(--padding);
    }
  }
</style>
