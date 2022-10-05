/**
 * @jest-environment jsdom
 */

import { AppPath, CONTEXT_PATH } from "$lib/constants/routes.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { routeStore } from "$lib/stores/route.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { SnsMetadataResponseEntries, SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import { snsResponsesForLifecycle } from "../../../mocks/sns-response.mock";

describe("currentSnsTokenLabelStore", () => {
  const data = snsResponsesForLifecycle({
    lifecycles: [SnsSwapLifecycle.Open],
    certified: true,
  });
  afterEach(() => {
    snsQueryStore.reset();
    routeStore.update({
      path: AppPath.LegacyNeurons,
    });
  });
  it("returns token symbol of current selected sns project", () => {
    snsQueryStore.setData(data);
    const [metadatas] = data;
    routeStore.update({
      path: `${CONTEXT_PATH}/${metadatas[0].rootCanisterId}/neurons`,
    });
    const ledgerMetadata = metadatas[0].token;
    const symbolResponse = ledgerMetadata.find(
      (metadata) => metadata[0] === SnsMetadataResponseEntries.SYMBOL
    );
    const symbol =
      symbolResponse !== undefined && "Text" in symbolResponse[1]
        ? symbolResponse[1].Text
        : undefined;
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken?.symbol).toBe(symbol);
  });

  it("returns undefined if selected project is NNS", () => {
    snsQueryStore.setData(data);
    routeStore.update({
      path: AppPath.LegacyNeurons,
    });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    const [metadatas] = data;
    routeStore.update({
      path: `${CONTEXT_PATH}/${metadatas[0].rootCanisterId}/neurons`,
    });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });
});
