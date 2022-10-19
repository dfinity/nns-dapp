<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import SnsNeuronMetaInfoCard from "$lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
  import { AppPathLegacy } from "$lib/constants/routes.constants";
  import { getSnsNeuron } from "$lib/services/sns-neurons.services";
  import { layoutBackStore } from "$lib/stores/layout.store";
  import { routeStore } from "$lib/stores/route.store";
  import { isRoutePath } from "$lib/utils/app-path.utils";
  import {
    routePathSnsNeuronRootCanisterId,
    routePathSnsNeuronId,
  } from "$lib/utils/sns-neuron.utils";
  import {
    type SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
    SELECTED_SNS_NEURON_CONTEXT_KEY,
  } from "$lib/types/sns-neuron-detail.context";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { neuronsPathStore } from "$lib/derived/paths.derived";

  const loadNeuron = async (
    { forceFetch }: { forceFetch: boolean } = { forceFetch: false }
  ) => {
    const { selected } = $selectedSnsNeuronStore;
    if (selected !== undefined) {
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
          selectedSnsNeuronStore.update((store) => ({
            ...store,
            neuron: undefined,
          }));
        },
      });
    }
  };

  const selectedSnsNeuronStore = writable<SelectedSnsNeuronStore>({
    selected: undefined,
    neuron: undefined,
  });

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: selectedSnsNeuronStore,
    reload: () => loadNeuron({ forceFetch: true }),
  });

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (
      !isRoutePath({ paths: [AppPathLegacy.NeuronDetail], routePath: path })
    ) {
      return;
    }
    const rootCanisterIdMaybe = routePathSnsNeuronRootCanisterId(path);
    const neuronIdMaybe = routePathSnsNeuronId(path);
    if (neuronIdMaybe === undefined || rootCanisterIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPathLegacy.LegacyNeurons });
      return;
    }
    let rootCanisterId: Principal | undefined;
    try {
      rootCanisterId = Principal.fromText(rootCanisterIdMaybe);
    } catch (error: unknown) {
      toastsError({
        labelKey: "error__sns.invalid_root_canister_id",
        substitutions: {
          $canisterId: rootCanisterIdMaybe,
        },
      });
      routeStore.replace({ path: AppPathLegacy.LegacyNeurons });
      return;
    }

    // `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
    selectedSnsNeuronStore.set({
      selected: {
        neuronIdHex: neuronIdMaybe,
        rootCanisterId,
      },
      neuron: null,
    });
    loadNeuron();
  });

  const goBack = () =>
    routeStore.navigate({
      path: $neuronsPathStore,
    });

  layoutBackStore.set(goBack);

  $: {
    if ($selectedSnsNeuronStore.neuron === undefined) {
      toastsError({
        labelKey: "error.neuron_not_found",
      });
      // Reset selected project
      routeStore.replace({ path: AppPathLegacy.LegacyNeurons });
    }
  }

  let loading: boolean;
  $: loading = $selectedSnsNeuronStore.neuron === null;
</script>

<main>
  <section data-tid="sns-neuron-detail-page">
    {#if loading}
      <SkeletonCard size="large" cardType="info" />
      <SkeletonCard cardType="info" />
    {:else}
      <SnsNeuronMetaInfoCard />
      <SnsNeuronHotkeysCard />
    {/if}
  </section>
</main>
