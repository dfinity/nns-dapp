import { Principal } from "@dfinity/principal";
import { SnsMetadataResponseEntries, SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import { OWN_CANISTER_ID } from "../../../../lib/constants/canister-ids.constants";
import { snsTokenSymbolSelectedStore } from "../../../../lib/derived/sns/sns-token-symbol-selected.store";
import { snsProjectSelectedStore } from "../../../../lib/stores/projects.store";
import { snsQueryStore } from "../../../../lib/stores/sns.store";
import { snsResponsesForLifecycle } from "../../../mocks/sns-response.mock";

describe("currentSnsTokenLabelStore", () => {
  const data = snsResponsesForLifecycle({
    lifecycles: [SnsSwapLifecycle.Open],
    certified: true,
  });
  afterEach(() => {
    snsQueryStore.reset();
    snsProjectSelectedStore.set(OWN_CANISTER_ID);
  });
  it("returns token value of current selected sns project", () => {
    snsQueryStore.setData(data);
    const [metadatas] = data;
    snsProjectSelectedStore.set(
      Principal.fromText(metadatas[0].rootCanisterId)
    );
    const ledgerMetadata = metadatas[0].token;
    const symbolResponse = ledgerMetadata.find(
      (metadata) => metadata[0] === SnsMetadataResponseEntries.SYMBOL
    );
    const symbol =
      symbolResponse !== undefined && "Text" in symbolResponse[1]
        ? symbolResponse[1].Text
        : undefined;
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBe(symbol);
  });

  it("returns undefined if selected project is NNS", () => {
    snsQueryStore.setData(data);
    snsProjectSelectedStore.set(OWN_CANISTER_ID);
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    const [metadatas] = data;
    snsProjectSelectedStore.set(
      Principal.fromText(metadatas[0].rootCanisterId)
    );
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });
});
