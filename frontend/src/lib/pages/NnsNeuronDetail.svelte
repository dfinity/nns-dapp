<script lang="ts">
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import NeuronFollowingCard from "$lib/components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
  import NeuronHotkeysCard from "$lib/components/neuron-detail/NeuronHotkeysCard.svelte";
  import NeuronMaturityCard from "$lib/components/neuron-detail/NeuronMaturityCard.svelte";
  import NeuronMetaInfoCard from "$lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
  import NnsNeuronInfoStake from "$lib/components/neuron-detail/NnsNeuronInfoStake.svelte";
  import NeuronProposalsCard from "$lib/components/neuron-detail/NeuronProposalsCard.svelte";
  import NeuronVotingHistoryCard from "$lib/components/neuron-detail/NeuronVotingHistoryCard.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import {
    getNeuronById,
    isSpawning,
    neuronVoting,
  } from "$lib/utils/neuron.utils";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import NeuronJoinFundCard from "$lib/components/neuron-detail/NeuronJoinFundCard.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";

  export let neuronIdText: string | undefined | null;

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
      neuronId: neuron.neuronId,
      store: $voteRegistrationStore,
    });

  $: layoutTitleStore.set(
    neuronId !== undefined ? `${$i18n.core.icp} – ${neuronId}` : ""
  );

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
</script>

<main class="legacy">
  <section data-tid="neuron-detail">
    {#if neuron && !inVotingProcess}
      <NeuronMetaInfoCard {neuron} />
      <hr />

      <NnsNeuronInfoStake {neuron} />
      <hr />

      <NeuronMaturityCard {neuron} />
      <hr />

      <NeuronJoinFundCard {neuron} />
      <hr />

      <NeuronFollowingCard {neuron} />
      <hr />

      {#if IS_TESTNET}
        <NeuronProposalsCard {neuron} />
        <hr />
      {/if}

      <NeuronHotkeysCard {neuron} />
      <hr />

      <NeuronVotingHistoryCard {neuron} />
    {:else}
      <SkeletonCard size="large" cardType="info" />
      <SkeletonCard cardType="info" />
      <SkeletonCard cardType="info" />
      <SkeletonCard cardType="info" />
    {/if}
  </section>
</main>

<style lang="scss">
  hr {
    color: var(--line);
    margin: var(--padding-4x) 0;
  }
</style>
