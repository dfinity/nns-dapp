/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("currentSnsTokenLabelStore", () => {
  const data = snsResponsesForLifecycle({
    lifecycles: [SnsSwapLifecycle.Committed],
    certified: true,
  });

  beforeEach(() => {
    snsQueryStore.reset();
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("returns token symbol of current selected sns project", () => {
    snsQueryStore.setData(data);
    const [metadatas] = data;
    page.mock({ data: { universe: metadatas[0].rootCanisterId } });
    const ledgerMetadata = metadatas[0].token;
    const symbolResponse = ledgerMetadata.find(
      (metadata) => metadata[0] === IcrcMetadataResponseEntries.SYMBOL
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
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    const [metadatas] = data;
    page.mock({ data: { universe: metadatas[0].rootCanisterId } });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });
});
