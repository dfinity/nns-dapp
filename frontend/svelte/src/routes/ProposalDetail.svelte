<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import {
    getProposalId,
    loadProposal,
  } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
  import ProposalDetailCard from "../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
  import VotesCard from "../lib/components/proposal-detail/VotesCard.svelte";
  import VotingCard from "../lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import { listNeurons } from "../lib/services/neurons.services";
  import { neuronsStore } from "../lib/stores/neurons.store";

  let proposalInfo: ProposalInfo | undefined;
  let neurons: NeuronInfo[] | undefined;
  let neuronsReady = false;
  $: neurons = $neuronsStore;

  // TODO: To be removed once this page has been implemented
  const showThisRoute = ["never", "staging"].includes(
    process.env.REDIRECT_TO_LEGACY as string
  );
  onMount(async () => {
    if (!showThisRoute) {
      window.location.replace(`/${window.location.hash}`);
      return;
    }

    await listNeurons();
    neuronsReady = true;
  });

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    proposalInfo = undefined;

    const proposalIdMaybe = getProposalId(path);
    if (proposalIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.Proposals });
      return;
    }

    const onError = () => {
      unsubscribe();

      // Wait a bit before redirection so the user recognizes on which page the error occures
      setTimeout(() => {
        routeStore.replace({ path: AppPath.Proposals });
      }, 1500);
    };

    await loadProposal({
      proposalId: proposalIdMaybe,
      setProposal: (proposal: ProposalInfo) => (proposalInfo = proposal),
      handleError: onError,
    });
  });

  onDestroy(unsubscribe);

  const goBack = () => {
    unsubscribe();

    routeStore.navigate({
      path: AppPath.Proposals,
    });
  };
</script>

{#if showThisRoute}
  <HeadlessLayout on:nnsBack={goBack} showFooter={false}>
    <svelte:fragment slot="header"
      >{$i18n.proposal_detail.title}</svelte:fragment
    >

    <section>
      {#if proposalInfo && neurons && neuronsReady}
        <ProposalDetailCard {proposalInfo} />
        <VotesCard {proposalInfo} {neurons} />
        <VotingCard {proposalInfo} {neurons} />
        <IneligibleNeuronsCard {proposalInfo} {neurons} />
      {:else}
        <Spinner />
      {/if}
    </section>
  </HeadlessLayout>
{/if}
