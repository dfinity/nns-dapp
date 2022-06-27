<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import Layout from "../lib/components/common/Layout.svelte";
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
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";
  import { neuronSelectStore, neuronsStore } from "../lib/stores/neurons.store";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { isRoutePath } from "../lib/utils/app-path.utils";

  // Neurons are fetch on page load. No need to do it in the route.

  let neuronId: NeuronId | undefined;
  $: neuronSelectStore.select(neuronId);

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
</script>

<Layout on:nnsBack={goBack} layout="detail">
  <svelte:fragment slot="header">{$i18n.neuron_detail.title}</svelte:fragment>
  <section data-tid="neuron-detail">
    {#if $neuronSelectStore}
      <NeuronMetaInfoCard neuron={$neuronSelectStore} />
      <NeuronMaturityCard neuron={$neuronSelectStore} />
      <NeuronFollowingCard neuron={$neuronSelectStore} />
      {#if IS_TESTNET}
        <NeuronProposalsCard neuron={$neuronSelectStore} />
      {/if}
      <NeuronHotkeysCard neuron={$neuronSelectStore} />
      <NeuronVotingHistoryCard neuron={$neuronSelectStore} />
    {:else}
      <SkeletonCard size="large" cardType="info" />
      <SkeletonCard cardType="info" />
      <SkeletonCard cardType="info" />
      <SkeletonCard cardType="info" />
    {/if}
  </section>
</Layout>
