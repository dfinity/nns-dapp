import { derived, type Readable } from "svelte/store";
import { snsProjectSelectedStore } from "../../stores/projects.store";
import { snsSummariesStore } from "../../stores/sns.store";

export const snsTokenSymbolSelectedStore: Readable<string | undefined> =
  derived(
    [snsProjectSelectedStore, snsSummariesStore],
    ([selectedRootCanisterId, summaries]) =>
      summaries.find(
        ({ rootCanisterId }) =>
          rootCanisterId.toText() === selectedRootCanisterId.toText()
      )?.token.symbol
  );
