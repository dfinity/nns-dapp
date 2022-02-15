<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import { getProposalInfo } from "../lib/utils/proposals.utils";
  import { routeContext } from "../lib/utils/route.utils";

  let proposalId: bigint;

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      // TODO: TBD
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const unsubscribe = routeStore.subscribe(async () => {
    const proposalParam = parseInt(routeContext().split("/").pop(), 10);
    if (!proposalParam) {
      routeStore.replace({ path: AppPath.Proposals });
      return;
    }

    proposalId = BigInt(proposalParam);

    // TODO: reuse from store
    // fetch for testing
    const proposal = await getProposalInfo({ proposalId });
    console.log("proposal", proposal);
  });

  onDestroy(unsubscribe);

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Proposals,
    });
  };
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">Proposal</svelte:fragment>

    <section>TBD</section>

    <svelte:fragment slot="footer" />
  </HeadlessLayout>
{/if}

<style lang="scss">
</style>
