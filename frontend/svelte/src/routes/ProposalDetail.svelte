<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import {
    getProposalId,
    loadProposal,
  } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import {
    AppPath,
    SHOW_PROPOSALS_ROUTE,
  } from "../lib/constants/routes.constants";
  import type { ProposalInfo } from "@dfinity/nns";
  import ProposalDetailCard from "../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
  import VotesCard from "../lib/components/proposal-detail/VotesCard.svelte";
  import VotingCard from "../lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import { listNeurons } from "../lib/services/neurons.services";
  import { neuronsStore } from "../lib/stores/neurons.store";
  import {
    proposalIdStore,
    proposalInfoStore,
  } from "../lib/stores/proposals.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";

  let neuronsReady = false;

  onMount(async () => {
    if (!SHOW_PROPOSALS_ROUTE) {
      window.location.replace(`/${window.location.hash}`);
      return;
    }

    await listNeurons();
    neuronsReady = true;
  });

  const unsubscribeRouteStore = routeStore.subscribe(
    async ({ path: routePath }) => {
      if (!isRoutePath({ path: AppPath.ProposalDetail, routePath })) {
        return;
      }
      const proposalId = getProposalId(routePath);

      if (proposalId === undefined) {
        // Navigate to the proposal list in no proposalId found
        routeStore.replace({ path: AppPath.Proposals });
        return;
      }

      proposalIdStore.set(proposalId);
    }
  );

  const onError = () => {
    routeStore.replace({ path: AppPath.Proposals });
  };

  const unsubscribeProposalIdStore = proposalIdStore.subscribe((proposalId) => {
    if (proposalId === undefined || proposalId === $proposalInfoStore?.id) {
      return;
    }
    loadProposal({
      proposalId,
      setProposal: ({ proposal }) => proposalInfoStore.set(proposal),
      handleError: onError,
    });
  });

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Proposals,
    });
  };

  onDestroy(() => {
    unsubscribeRouteStore();
    unsubscribeProposalIdStore();
    proposalIdStore.reset();
  });
</script>

{#if SHOW_PROPOSALS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack} showFooter={false}>
    <svelte:fragment slot="header"
      >{$i18n.proposal_detail.title}</svelte:fragment
    >

    <section>
      {#if $proposalInfoStore && $neuronsStore && neuronsReady}
        <ProposalDetailCard proposalInfo={$proposalInfoStore} />
        <VotesCard proposalInfo={$proposalInfoStore} />
        <VotingCard proposalInfo={$proposalInfoStore} />
        <IneligibleNeuronsCard
          proposalInfo={$proposalInfoStore}
          neurons={$neuronsStore}
        />
      {:else}
        <Spinner />
      {/if}
    </section>
  </HeadlessLayout>
{/if}
