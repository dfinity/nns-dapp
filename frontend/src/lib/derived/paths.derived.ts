import { derived } from "svelte/store";
import { paths } from "../utils/app-path.utils";
import { snsProjectSelectedStore } from "./selected-project.derived";

export const accountsPathStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore) =>
    paths.accounts($snsProjectSelectedStore.toText())
);

export const walletPathStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore) => paths.wallet($snsProjectSelectedStore.toText())
);

export const neuronsPathStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore) => paths.neurons($snsProjectSelectedStore.toText())
);

export const neuronPathStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore) =>
    paths.neuronDetail($snsProjectSelectedStore.toText())
);
