<script lang="ts">
  import { onMount } from "svelte";
  import Layout from "../lib/components/common/Layout.svelte";
  import SNSCurrentLaunches from "../lib/components/sns-launchpad/SNSCurrentLaunches.svelte";
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
  <SNSCurrentLaunches />
  <SNSProposals />
</Layout>
