/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
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
    page.mock({ universe: OWN_CANISTER_ID_TEXT });
  });
  it("returns token symbol of current selected sns project", () => {
    snsQueryStore.setData(data);
    const [metadatas] = data;
    page.mock({ universe: metadatas[0].rootCanisterId });
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
    page.mock({ universe: OWN_CANISTER_ID_TEXT });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    const [metadatas] = data;
    page.mock({ universe: metadatas[0].rootCanisterId });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });
});
