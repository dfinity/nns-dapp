<script lang="ts">
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import {
    routePathNeuronId,
    loadNeuron,
  } from "../lib/services/neurons.services";
  import NeuronFollowingCard from "../lib/components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
  import NeuronHotkeysCard from "../lib/components/neuron-detail/NeuronHotkeysCard.svelte";
  import NeuronMaturityCard from "../lib/components/neuron-detail/NeuronMaturityCard.svelte";
  import NeuronMetaInfoCard from "../lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
  import NeuronProposalsCard from "../lib/components/neuron-detail/NeuronProposalsCard.svelte";
  import NeuronVotingHistoryCard from "../lib/components/neuron-detail/NeuronVotingHistoryCard.svelte";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import { neuronsStore } from "../lib/stores/neurons.store";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    getNeuronById,
    isSpawning,
    neuronVoting,
  } from "../lib/utils/neuron.utils";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import NeuronJoinFundCard from "../lib/components/neuron-detail/NeuronJoinFundCard.svelte";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { voteRegistrationStore } from "../lib/stores/vote-registration.store";

  // Neurons are fetch on page load. No need to do it in the route.

  let neuronId: NeuronId | undefined;
  let neuron: NeuronInfo | undefined;
  $: neuron =
    neuronId !== undefined
      ? getNeuronById({ neuronsStore: $neuronsStore, neuronId })
      : undefined;

  $: {
    // Spawning neuron can't access the details
    // TODO: Test with a spawning neuron
    if (neuron && isSpawning(neuron)) {
      toastsStore.error({
        labelKey: "error.neuron_spawning",
      });
      routeStore.replace({ path: AppPath.Neurons });
    }
  }

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (!isRoutePath({ path: AppPath.NeuronDetail, routePath: path })) {
      return;
    }
    const neuronIdMaybe = routePathNeuronId(path);
    if (neuronIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.Neurons });
      return;
    }
    neuronId = neuronIdMaybe;

    const onError = () => {
      unsubscribe();

      // Wait a bit before redirection so the user recognizes on which page the error occures
      setTimeout(() => {
        routeStore.replace({ path: AppPath.Neurons });
      }, 1500);
    };

    await loadNeuron({
      neuronId: neuronIdMaybe,
      setNeuron: ({ neuron, certified }) =>
        neuronsStore.pushNeurons({ neurons: [neuron], certified }),
      handleError: onError,
    });
  });

  onDestroy(unsubscribe);

  const goBack = () => {
    unsubscribe();

    routeStore.navigate({
      path: AppPath.Neurons,
    });
  };

  layoutBackStore.set(goBack);

  let inVotingProcess: boolean = false;
  $: inVotingProcess =
    neuron !== undefined &&
    neuronVoting({
      neuronId: neuron.neuronId,
      store: $voteRegistrationStore,
    });
</script>

<main class="legacy">
  <section data-tid="neuron-detail">
    {#if neuron && !inVotingProcess}
      <NeuronMetaInfoCard {neuron} />
      <NeuronMaturityCard {neuron} />
      <NeuronJoinFundCard {neuron} />
      <NeuronFollowingCard {neuron} />
      {#if IS_TESTNET}
        <NeuronProposalsCard {neuron} />
      {/if}
      <NeuronHotkeysCard {neuron} />
      <NeuronVotingHistoryCard {neuron} />
    {:else}
      <SkeletonCard size="large" cardType="info" />
      <SkeletonCard cardType="info" />
      <SkeletonCard cardType="info" />
      <SkeletonCard cardType="info" />
    {/if}
  </section>
</main>
