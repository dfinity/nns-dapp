<script lang="ts">
  import { onMount } from "svelte";
  import SNSProjects from "../lib/components/sns-launchpad/SNSProjects.svelte";
  import SNSProposals from "../lib/components/sns-launchpad/SNSProposals.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });
</script>

<SNSProjects />
<SNSProposals />
