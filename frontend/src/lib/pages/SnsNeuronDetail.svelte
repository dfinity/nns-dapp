<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import SnsNeuronMetaInfoCard from "$lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
  import { getSnsNeuron } from "$lib/services/sns-neurons.services";
  import {
    type SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
    SELECTED_SNS_NEURON_CONTEXT_KEY,
  } from "$lib/types/sns-neuron-detail.context";
  import { writable } from "svelte/store";
  import { onMount, setContext } from "svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import SnsNeuronMaturityCard from "$lib/components/sns-neuron-detail/SnsNeuronMaturityCard.svelte";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";
  import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
  import SnsNeuronInfoStake from "$lib/components/sns-neuron-detail/SnsNeuronInfoStake.svelte";

  export let neuronId: string | null | undefined;

  const selectedSnsNeuronStore = writable<SelectedSnsNeuronStore>({
    selected: undefined,
    neuron: undefined,
  });

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: selectedSnsNeuronStore,
    reload: () => loadNeuron({ forceFetch: true }),
  });

  // BEGIN: loading and navigation

  const goBack = (replaceState: boolean): Promise<void> =>
    goto($neuronsPathStore, { replaceState });

  const loadNeuron = async (
    { forceFetch }: { forceFetch: boolean } = { forceFetch: false }
  ) => {
    const { selected } = $selectedSnsNeuronStore;
    if (selected !== undefined && $pageStore.path === AppPath.Neuron) {
      await getSnsNeuron({
        forceFetch,
        rootCanisterId: selected.rootCanisterId,
        neuronIdHex: selected.neuronIdHex,
        onLoad: ({ neuron: snsNeuron }: { neuron: SnsNeuron }) => {
          selectedSnsNeuronStore.update((store) => ({
            ...store,
            neuron: snsNeuron,
          }));
        },
        onError: () => {
          toastsError({
            labelKey: "error.neuron_not_found",
          });

          // For simplicity reason we do not catch the promise here
          goBack(true);
        },
      });
    }
  };

  onMount(async () => {
    if (neuronId === undefined || neuronId === null) {
      await goBack(true);
      return;
    }

    try {
      // `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
      selectedSnsNeuronStore.set({
        selected: {
          neuronIdHex: neuronId,
          rootCanisterId: Principal.fromText($pageStore.universe),
        },
        neuron: null,
      });

      await loadNeuron();
    } catch (err: unknown) {
      // $pageStore.universe might be an invalid principal, like empty or yolo
      await goBack(true);
    }
  });

  // END: loading and navigation

  let loading: boolean;
  $: loading = $selectedSnsNeuronStore.neuron === null;
</script>

<main class="legacy">
  <section data-tid="sns-neuron-detail-page">
    {#if loading}
      <SkeletonCard size="large" cardType="info" separator />
      <SkeletonCard cardType="info" separator />
      <SkeletonCard cardType="info" separator />
      <SkeletonCard cardType="info" separator />
    {:else}
      <SnsNeuronMetaInfoCard />
      <SnsNeuronInfoStake />
      <SnsNeuronMaturityCard />
      {#if ENABLE_SNS_2}
        <SnsNeuronFollowingCard />
      {/if}
      <SnsNeuronHotkeysCard />
    {/if}
  </section>
</main>
