<script lang="ts">
  import { onMount } from "svelte";
  import Layout from "../lib/components/common/Layout.svelte";
  import SNSLaunchpadProjects from "../lib/components/sns-launchpad/SNSLaunchpadProjects.svelte";
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

<Layout>
  <svelte:fragment slot="header">{$i18n.sns_launchpad.header}</svelte:fragment>
  <SNSLaunchpadProjects />
  <SNSProposals />
</Layout>
