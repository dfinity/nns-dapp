<script lang="ts">
  import { onMount } from "svelte";
  import SNSProjects from "../lib/components/sns-launchpad/SNSProjects.svelte";
  import SNSProposals from "../lib/components/sns-launchpad/SNSProposals.svelte";
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

<h2>{$i18n.sns_launchpad.projects}</h2>
<SNSProjects />

<h2>{$i18n.sns_launchpad.proposals}</h2>
<SNSProposals />

<style lang="scss">
  h2 {
    margin: var(--padding-3x) 0;
  }
</style>
