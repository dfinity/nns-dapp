<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import {
    getProposalId,
    getProposal,
  } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import type { NeuronInfo, ProposalId, ProposalInfo } from "@dfinity/nns";
  import ProposalDetailCard from "../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
  import VotesCard from "../lib/components/proposal-detail/VotesCard.svelte";
  import CastVoteCard from "../lib/components/proposal-detail/CastVoteCard.svelte";
  import IneligibleNeuronsCard from "../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import { authStore } from "../lib/stores/auth.store";
  import { listNeurons } from "../lib/services/neurons.services";
  import { neuronsStore } from "../lib/stores/neurons.store";

  let proposalInfo: ProposalInfo | undefined;
  let neurons: NeuronInfo[] | undefined;
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
  });

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    const proposalIdMaybe = getProposalId(path);
    if (proposalIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.Proposals });
      return;
    }
    const proposalId: ProposalId = proposalIdMaybe;

    try {
      const proposalInfoMaybe = await getProposal({
        proposalId,
        identity: $authStore.identity,
      });

      if (!proposalInfoMaybe) {
        throw new Error("Proposal not found");
      }
      proposalInfo = proposalInfoMaybe;
    } catch (error) {
      unsubscribe();
      console.error(error);
      toastsStore.show({
        labelKey: "error.proposal_not_found",
        level: "error",
        detail: `id: "${proposalId}"`,
      });

      // Wait a bit before redirection so the user recognizes on which page the error occures
      setTimeout(() => {
        routeStore.replace({ path: AppPath.Proposals });
      }, 1500);
    }
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
      {#if proposalInfo && neurons}
        <ProposalDetailCard {proposalInfo} />
        <VotesCard {proposalInfo} />
        <CastVoteCard {proposalInfo} {neurons} />
        <IneligibleNeuronsCard {proposalInfo} />
      {:else}
        <Spinner />
      {/if}
    </section>
  </HeadlessLayout>
{/if}
