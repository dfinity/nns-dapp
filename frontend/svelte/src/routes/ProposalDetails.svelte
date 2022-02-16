<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { getProposalInfo } from "../lib/utils/proposals.utils";
  import { routeContext } from "../lib/utils/route.utils";
  import { stringifyJson } from "../lib/utils/utils";

  let proposal: ProposalInfo;

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

    try {
      proposal = await getProposalInfo({
        proposalId: BigInt(proposalParam),
      });

      if (!proposal) {
        throw new Error("Proposal not found");
      }
    } catch (error) {
      console.error(error);

      toastsStore.show({
        labelKey: "error.proposal_not_found",
        level: "error",
        detail: `id: "${proposalParam}"`,
      });

      // to not refetch on navigation
      unsubscribe();

      setTimeout(() => {
        routeStore.replace({ path: AppPath.Proposals });
      }, 1500);
    }
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

    <section>
      <pre>{stringifyJson(proposal)}</pre>
    </section>

    <svelte:fragment slot="footer" />
  </HeadlessLayout>
{/if}

<style lang="scss">
</style>
