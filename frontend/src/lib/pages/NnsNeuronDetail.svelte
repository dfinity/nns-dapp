<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ConfirmFollowingBanner from "$lib/components/neuron-detail/ConfirmFollowingBanner.svelte";
  import NeuronFollowingCard from "$lib/components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
  import NeuronVotingHistoryCard from "$lib/components/neuron-detail/NeuronVotingHistoryCard.svelte";
  import NnsNeuronAdvancedSection from "$lib/components/neuron-detail/NnsNeuronAdvancedSection.svelte";
  import NnsNeuronHotkeysCard from "$lib/components/neuron-detail/NnsNeuronHotkeysCard.svelte";
  import NnsNeuronMaturitySection from "$lib/components/neuron-detail/NnsNeuronMaturitySection.svelte";
  import NnsNeuronPageHeader from "$lib/components/neuron-detail/NnsNeuronPageHeader.svelte";
  import NnsNeuronPageHeading from "$lib/components/neuron-detail/NnsNeuronPageHeading.svelte";
  import NnsNeuronProposalsCard from "$lib/components/neuron-detail/NnsNeuronProposalsCard.svelte";
  import NnsNeuronTestnetFunctionsCard from "$lib/components/neuron-detail/NnsNeuronTestnetFunctionsCard.svelte";
  import NnsNeuronVotingPowerSection from "$lib/components/neuron-detail/NnsNeuronVotingPowerSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import SkeletonHeader from "$lib/components/ui/SkeletonHeader.svelte";
  import SkeletonHeading from "$lib/components/ui/SkeletonHeading.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { startReducingVotingPowerAfterSecondsStore } from "$lib/derived/network-economics.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import {
    listNeurons,
    refreshNeuronIfNeeded,
  } from "$lib/services/neurons.services";
  import { loadLatestRewardEvent } from "$lib/services/nns-reward-event.services";
  import { ENABLE_PERIODIC_FOLLOWING_CONFIRMATION } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";
  import { isForceCallStrategy } from "$lib/utils/call.utils";
  import {
    getNeuronById,
    isSpawning,
    neuronVoting,
    isNeuronMissingRewardSoon,
    hasEnoughDissolveDelayToVote,
  } from "$lib/utils/neuron.utils";
  import { Island } from "@dfinity/gix-components";
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";

  export let neuronIdText: string | undefined | null;

  onMount(() => {
    listNeurons();
    loadLatestRewardEvent();
  });

  const mapNeuronId = (
    neuronIdText: string | undefined | null
  ): NeuronId | undefined => {
    try {
      return neuronIdText ? BigInt(neuronIdText) : undefined;
    } catch (_err: unknown) {
      return undefined;
    }
  };

  let neuronId: NeuronId | undefined;
  $: neuronId = mapNeuronId(neuronIdText);

  // BEGIN: loading and navigation

  const goBack = (replaceState: boolean): Promise<void> =>
    goto(AppPath.Neurons, { replaceState });

  type NeuronFromStore = { neuron: NeuronInfo | undefined };

  const neuronDidUpdate = async ({ neuron }: NeuronFromStore) => {
    // handle unknown neuronId from URL
    if (
      neuron === undefined &&
      $neuronsStore.neurons !== undefined &&
      // After neuron staking the query (not certified) call can return the outdated neuron list
      // so if the neuron is undefined it's more reliable to wait for the update call.
      ($neuronsStore.certified === true ||
        ($neuronsStore.certified === false && isForceCallStrategy())) &&
      $pageStore.path === AppPath.Neuron
    ) {
      toastsError({
        labelKey: $i18n.error.neuron_not_found,
      });

      await goBack(false);
    }
  };

  // We need an object to trigger the observer even if undefined is applied after undefined initial value
  let neuronFromStore: NeuronFromStore;
  $: neuronFromStore = {
    neuron:
      neuronId !== undefined && neuronId !== null
        ? getNeuronById({ neuronsStore: $neuronsStore, neuronId })
        : undefined,
  };

  $: (async () => await neuronDidUpdate(neuronFromStore))();

  let neuron: NeuronInfo | undefined;
  $: ({ neuron } = neuronFromStore);

  // END: loading and navigation

  let inVotingProcess = false;
  $: inVotingProcess =
    neuron !== undefined &&
    neuronVoting({
      neuronIdString: `${neuron.neuronId}`,
      store: $voteRegistrationStore,
    });

  const redirectIfSpawning = async (neuron: NeuronInfo | undefined) => {
    // Spawning neuron can't access the details
    // TODO: Test with a spawning neuron
    if (neuron !== undefined && isSpawning(neuron)) {
      toastsError({
        labelKey: "error.neuron_spawning",
      });
      await goBack(true);
    }
  };

  $: (async () => await redirectIfSpawning(neuron))();

  // Context
  const selectedNeuronStore = writable<NnsNeuronStore>({
    neuron,
  });

  $: neuron,
    (() =>
      selectedNeuronStore.update((data) => ({
        ...data,
        neuron,
      })))();

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: selectedNeuronStore,
  });

  $: if (nonNullish(neuron)) {
    refreshNeuronIfNeeded(neuron);
  }

  let isConfirmFollowingVisible = false;
  $: isConfirmFollowingVisible =
    $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION &&
    nonNullish(neuron) &&
    hasEnoughDissolveDelayToVote(neuron) &&
    isNeuronMissingRewardSoon({
      neuron,
      startReducingVotingPowerAfterSeconds:
        $startReducingVotingPowerAfterSecondsStore,
    });
</script>

<TestIdWrapper testId="nns-neuron-detail-component">
  <Island>
    <main class="legacy">
      <section data-tid="neuron-detail">
        {#if neuron && !inVotingProcess}
          <NnsNeuronPageHeader {neuron} />
          <NnsNeuronPageHeading {neuron} />

          {#if isConfirmFollowingVisible}
            <ConfirmFollowingBanner />
          {/if}

          <Separator spacing="none" />
          <NnsNeuronVotingPowerSection {neuron} />
          <Separator spacing="none" />
          <NnsNeuronMaturitySection {neuron} />
          <Separator spacing="none" />
          <NnsNeuronAdvancedSection {neuron} />
          <Separator spacing="none" />
          <NeuronFollowingCard {neuron} />
          <Separator spacing="none" />
          <NnsNeuronHotkeysCard {neuron} />
          <Separator spacing="none" />
          {#if IS_TESTNET}
            <NnsNeuronProposalsCard {neuron} />
            <Separator spacing="none" />
            <NnsNeuronTestnetFunctionsCard {neuron} />
            <Separator spacing="none" />
          {/if}
          <NeuronVotingHistoryCard {neuron} />
        {:else}
          <SkeletonHeader />
          <SkeletonHeading />
          <Separator spacing="none" />
          <SkeletonCard noMargin cardType="info" />
          <Separator spacing="none" />
          <SkeletonCard noMargin cardType="info" />
          <Separator spacing="none" />
          <SkeletonCard noMargin cardType="info" />
        {/if}
      </section>
    </main>
  </Island>

  <NnsNeuronModals />
</TestIdWrapper>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }
</style>
