<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronHotkeysCard from "../lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import SnsNeuronMetaInfoCard from "../lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
  import { AppPath } from "../lib/constants/routes.constants";
  import { getSnsNeuron } from "../lib/services/sns-neurons.services";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import { selectedProjectStore } from "../lib/derived/projects/selected-project.store";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    routePathSnsNeuronRootCanisterId,
    routePathSnsNeuronId,
  } from "../lib/utils/sns-neuron.utils";
  import {
    type SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
    SELECTED_SNS_NEURON_CONTEXT_KEY,
  } from "../lib/types/sns-neuron-detail.context";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";

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
          console.error("Error loading neuron");
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
    reload: loadNeuron,
  });

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (!isRoutePath({ path: AppPath.SnsNeuronDetail, routePath: path })) {
      return;
    }
    const rootCanisterIdMaybe = routePathSnsNeuronRootCanisterId(path);
    const neuronIdMaybe = routePathSnsNeuronId(path);
    if (neuronIdMaybe === undefined || rootCanisterIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.Neurons });
      return;
    }
    const rootCanisterId = Principal.fromText(rootCanisterIdMaybe);

    // `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
    selectedSnsNeuronStore.set({
      selected: {
        neuronIdHex: neuronIdMaybe,
        rootCanisterId,
      },
      neuron: undefined,
    });
    loadNeuron();
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Neurons,
    });

  layoutBackStore.set(goBack);
</script>

<main>
  <section data-tid="sns-neuron-detail-page">
    <SnsNeuronMetaInfoCard />
    <SnsNeuronHotkeysCard />
  </section>
</main>
