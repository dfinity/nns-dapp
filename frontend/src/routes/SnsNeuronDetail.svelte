<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { AppPath } from "../lib/constants/routes.constants";
  import { getSnsNeuron } from "../lib/services/sns-neurons.services";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    getSnsNeuronIdAsHexString,
    routePathSnsNeuronCanisterId,
    routePathSnsNeuronId,
  } from "../lib/utils/sns-neuron.utils";

  let snsNeuron: SnsNeuron | undefined;

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (!isRoutePath({ path: AppPath.SnsNeuronDetail, routePath: path })) {
      return;
    }
    const rootCanisterIdMaybe = routePathSnsNeuronCanisterId(path);
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
      onLoad: ({ neuron }: { neuron: SnsNeuron }) => {
        snsNeuron = neuron;
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

<!-- TODO: Implement UI https://dfinity.atlassian.net/browse/L2-866 -->
<div data-tid="sns-neuron-detail-page">
  {`Neuron detail ${
    snsNeuron === undefined ? "" : getSnsNeuronIdAsHexString(snsNeuron)
  }`}
</div>
