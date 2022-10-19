<script lang="ts">
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import { loadNeuron } from "$lib/services/neurons.services";
  import NeuronFollowingCard from "$lib/components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
  import NeuronHotkeysCard from "$lib/components/neuron-detail/NeuronHotkeysCard.svelte";
  import NeuronMaturityCard from "$lib/components/neuron-detail/NeuronMaturityCard.svelte";
  import NeuronMetaInfoCard from "$lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
  import NeuronProposalsCard from "$lib/components/neuron-detail/NeuronProposalsCard.svelte";
  import NeuronVotingHistoryCard from "$lib/components/neuron-detail/NeuronVotingHistoryCard.svelte";
  import { AppPathLegacy } from "$lib/constants/routes.constants";
  import { routeStore } from "$lib/stores/route.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { isRoutePath } from "$lib/utils/app-path.utils";
  import {
    getNeuronById,
    isSpawning,
    neuronVoting,
    routePathNeuronId,
  } from "$lib/utils/neuron.utils";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import NeuronJoinFundCard from "$lib/components/neuron-detail/NeuronJoinFundCard.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsPathStore } from "$lib/derived/paths.derived";

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
      routeStore.replace({ path: AppPathLegacy.LegacyNeurons });
    }
  }

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (
      !isRoutePath({
        paths: [AppPathLegacy.LegacyNeuronDetail, AppPathLegacy.NeuronDetail],
        routePath: path,
      })
    ) {
      return;
    }
    const neuronIdMaybe = routePathNeuronId(path);
    if (neuronIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPathLegacy.LegacyNeurons });
      return;
    }
    neuronId = neuronIdMaybe;

    const onError = () => {
      unsubscribe();

      // Wait a bit before redirection so the user recognizes on which page the error occures
      setTimeout(() => {
        routeStore.replace({ path: AppPathLegacy.LegacyNeurons });
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
      path: $neuronsPathStore,
    });
  };

  layoutBackStore.set(goBack);

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
