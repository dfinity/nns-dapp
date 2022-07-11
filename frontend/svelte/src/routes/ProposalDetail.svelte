<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    routePathProposalId,
    loadProposal,
  } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import type { ProposalInfo } from "@dfinity/nns";
  import ProposalDetailCard from "../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
  import VotesCard from "../lib/components/proposal-detail/VotesCard.svelte";
  import VotingCard from "../lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {
    definedNeuronsStore,
    neuronsStore,
  } from "../lib/stores/neurons.store";
  import {
    proposalIdStore,
    proposalInfoStore,
  } from "../lib/stores/proposals.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import { get } from "svelte/store";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";

  // Neurons are fetch on page load. No need to do it in the route.

  const neuronsStoreReady = (): boolean => {
    // We consider the neurons store as ready if it has been initialized once. Subsequent changes that happen after vote or other functions are handled with the busy store.
    // This to avoid the display of a spinner within the page and another spinner over it (the busy spinner) when the user vote is being processed.
    if (neuronsReady) {
      return true;
    }

    return (
      $neuronsStore.neurons !== undefined && $neuronsStore.certified === true
    );
  };

  let neuronsReady = false;
  $: $neuronsStore, (neuronsReady = neuronsStoreReady());

  const unsubscribeRouteStore = routeStore.subscribe(
    async ({ path: routePath }) => {
      if (!isRoutePath({ path: AppPath.ProposalDetail, routePath })) {
        return;
      }
      const proposalId = routePathProposalId(routePath);

      if (proposalId === undefined) {
        // Navigate to the proposal list in no proposalId found
        routeStore.replace({ path: AppPath.Proposals });
        return;
      }

      proposalIdStore.set(proposalId);
    }
  );

  const onError = (certified: boolean) => {
    // Ignore "application payload size (X) cannot be larger than Y" error thrown by update calls
    if (certified) {
      return;
    }
    routeStore.replace({ path: AppPath.Proposals });
  };

  const unsubscribeProposalIdStore = proposalIdStore.subscribe((proposalId) => {
    if (proposalId === undefined || proposalId === $proposalInfoStore?.id) {
      return;
    }
    loadProposal({
      proposalId,
      setProposal: (proposalInfo: ProposalInfo) =>
        proposalInfoStore.set(proposalInfo),
      handleError: onError,
      silentUpdateErrorMessages: true,
    });
  });

  const goBack = () => {
    const { referrerPath } = get(routeStore);
    routeStore.navigate({
      path:
        referrerPath === AppPath.Launchpad
          ? AppPath.Launchpad
          : AppPath.Proposals,
    });
  };

  layoutBackStore.set(goBack);

  onDestroy(() => {
    unsubscribeRouteStore();
    unsubscribeProposalIdStore();
    proposalIdStore.reset();
  });
</script>

<MainContentWrapper>
  <section>
    {#if $proposalInfoStore}
      <ProposalDetailCard proposalInfo={$proposalInfoStore} />

      {#if neuronsReady}
        <VotesCard proposalInfo={$proposalInfoStore} />
        <VotingCard proposalInfo={$proposalInfoStore} />
        <IneligibleNeuronsCard
          proposalInfo={$proposalInfoStore}
          neurons={$definedNeuronsStore}
        />
      {:else}
        <div class="loader">
          <SkeletonCard cardType="info" />
          <span><small>{$i18n.proposal_detail.loading_neurons}</small></span>
        </div>
      {/if}
    {:else}
      <div class="loader">
        <SkeletonCard cardType="info" />
        <span><small>{$i18n.proposal_detail.loading_neurons}</small></span>
      </div>
    {/if}
  </section>
</MainContentWrapper>

<style lang="scss">
  .loader {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: var(--padding-2x) 0;

    span {
      text-align: center;
    }
  }
</style>
