<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { getProposalInfo } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { routeContext } from "../lib/utils/route.utils";
  import { AppPath } from "../lib/constants/routes.constants";
  import type { ProposalInfo } from "@dfinity/nns";
  import ProposalDetailCard from "../lib/components/proposal-detail/ProposalDetailCard.svelte";
  import VotesCard from "../lib/components/proposal-detail/VotesCard.svelte";
  import CastVoteCard from "../lib/components/proposal-detail/CastVoteCard.svelte";
  import IneligibleNeuronsCard from "../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";

  let proposalInfo: ProposalInfo;

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const unsubscribe = routeStore.subscribe(async () => {
    // TODO: fix /0
    const proposalParam = parseInt(routeContext().split("/").pop(), 10);
    if (!proposalParam) {
      routeStore.replace({ path: AppPath.Proposals });
      return;
    }

    // TODO: move to service?
    try {
      // TODO: as unknown?
      proposalInfo = (await getProposalInfo({
        proposalId: BigInt(proposalParam),
      })) as unknown as ProposalInfo;

      if (!proposalInfo) {
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

      // TODO: add a comment here
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
    <!-- TODO: i18n -->
    <svelte:fragment slot="header">Proposal</svelte:fragment>

    <section>
      {#if proposalInfo}
        <ProposalDetailCard {proposalInfo} />
        <VotesCard {proposalInfo} />
        <CastVoteCard {proposalInfo} />
        <IneligibleNeuronsCard {proposalInfo} />
      {:else}
        <Spinner />
      {/if}
    </section>
  </HeadlessLayout>
{/if}
