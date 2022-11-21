import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import {
  snsParametersStore,
  type SnsParameters,
} from "$lib/stores/sns-parameters.store";
import { derived, type Readable } from "svelte/store";

export const snsProjectParametersStore: Readable<SnsParameters | undefined> =
  derived(
    [snsParametersStore, snsProjectIdSelectedStore],
    ([store, selectedSnsRootCanisterId]) =>
      store[selectedSnsRootCanisterId.toText()]
  );
