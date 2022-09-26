<script lang="ts">
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import { routePathNeuronId, loadNeuron } from "../services/neurons.services";
  import NeuronFollowingCard from "../components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
  import NeuronHotkeysCard from "../components/neuron-detail/NeuronHotkeysCard.svelte";
  import NeuronMaturityCard from "../components/neuron-detail/NeuronMaturityCard.svelte";
  import NeuronMetaInfoCard from "../components/neuron-detail/NeuronMetaInfoCard.svelte";
  import NeuronProposalsCard from "../components/neuron-detail/NeuronProposalsCard.svelte";
  import NeuronVotingHistoryCard from "../components/neuron-detail/NeuronVotingHistoryCard.svelte";
  import { AppPath } from "../constants/routes.constants";
  import { routeStore } from "../stores/route.store";
  import { neuronsStore } from "../stores/neurons.store";
  import { IS_TESTNET } from "../constants/environment.constants";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import { isRoutePath } from "../utils/app-path.utils";
  import {
    getNeuronById,
    isSpawning,
    neuronVoting,
  } from "../utils/neuron.utils";
  import { layoutBackStore, layoutTitleStore } from "../stores/layout.store";
  import NeuronJoinFundCard from "../components/neuron-detail/NeuronJoinFundCard.svelte";
  import { toastsError } from "../stores/toasts.store";
  import { voteRegistrationStore } from "../stores/vote-registration.store";
  import { i18n } from "../stores/i18n";

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
      toastsError({
        labelKey: "error.neuron_spawning",
      });
      routeStore.replace({ path: AppPath.LegacyNeurons });
    }
  }

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (
      !isRoutePath({ path: AppPath.LegacyNeuronDetail, routePath: path }) &&
      !isRoutePath({ path: AppPath.NeuronDetail, routePath: path })
    ) {
      return;
    }
    const neuronIdMaybe = routePathNeuronId(path);
    if (neuronIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.LegacyNeurons });
      return;
    }
    neuronId = neuronIdMaybe;

    const onError = () => {
      unsubscribe();

      // Wait a bit before redirection so the user recognizes on which page the error occures
      setTimeout(() => {
        routeStore.replace({ path: AppPath.LegacyNeurons });
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
      path: AppPath.LegacyNeurons,
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

  $: layoutTitleStore.set(
    neuronId !== undefined ? `${$i18n.core.icp} – ${neuronId}` : ""
  );
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
