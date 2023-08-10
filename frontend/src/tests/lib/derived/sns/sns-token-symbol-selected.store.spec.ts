/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { page } from "$mocks/$app/stores";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("currentSnsTokenLabelStore", () => {
  const rootCanisterId = rootCanisterIdMock;
  const universe = rootCanisterId.toText();
  const projectParams = {
    rootCanisterId: rootCanisterIdMock,
    lifecycle: SnsSwapLifecycle.Committed,
    certified: true,
    tokenMetadata: mockToken,
  };

  beforeEach(() => {
    resetSnsProjects();
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("returns token symbol of current selected sns project", () => {
    setSnsProjects([projectParams]);
    page.mock({ data: { universe } });

    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken?.symbol).toBe(mockToken.symbol);
  });

  it("returns undefined if selected project is NNS", () => {
    setSnsProjects([projectParams]);
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    page.mock({ data: { universe } });
    const expectedToken = get(snsTokenSymbolSelectedStore);

    expect(expectedToken).toBeUndefined();
  });
});
