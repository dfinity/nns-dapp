import { derived, type Readable } from "svelte/store";
import { selectedProjectStore } from "../../derived/projects/selected-project.store";
import { snsSummariesStore } from "../../stores/sns.store";

export const snsTokenSymbolSelectedStore: Readable<string | undefined> =
  derived(
    [selectedProjectStore, snsSummariesStore],
    ([selectedRootCanisterId, summaries]) =>
      summaries.find(
        ({ rootCanisterId }) =>
          rootCanisterId.toText() === selectedRootCanisterId.toText()
      )?.token.symbol
  );
