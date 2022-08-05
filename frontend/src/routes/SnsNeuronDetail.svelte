<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsNeuronHotkeysCard from "../lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import SnsNeuronMetaInfoCard from "../lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import { AppPath } from "../lib/constants/routes.constants";
  import { getSnsNeuron } from "../lib/services/sns-neurons.services";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    routePathSnsNeuronRootCanisterId,
    routePathSnsNeuronId,
  } from "../lib/utils/sns-neuron.utils";

  let neuron: SnsNeuron | undefined;

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

    getSnsNeuron({
      rootCanisterId,
      neuronIdHex: neuronIdMaybe,
      onLoad: ({ neuron: snsNeuron }: { neuron: SnsNeuron }) => {
        neuron = snsNeuron;
      },
      onError: () => {
        console.error("Error loading neuron");
      },
    });
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Neurons,
    });

  layoutBackStore.set(goBack);
</script>

<MainContentWrapper>
  <section data-tid="sns-neuron-detail-page">
    {#if neuron !== undefined}
      <SnsNeuronMetaInfoCard {neuron} />
      <SnsNeuronHotkeysCard {neuron} />
    {/if}
  </section>
</MainContentWrapper>
