import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("snsSelectedTransactionFeeStore", () => {
  const rootCanisterId = mockPrincipal;
  const universe = rootCanisterId.toText();
  const projectParams = {
    rootCanisterId: mockPrincipal,
    lifecycle: SnsSwapLifecycle.Committed,
    certified: true,
    tokenMetadata: mockToken,
  };
  beforeEach(() => {
    page.mock({ data: { universe: mockPrincipal.toText() } });
  });

  it("returns transaction fee of current selected sns project", () => {
    page.mock({ data: { universe } });

    const fee = 11_000n;
    setSnsProjects([
      {
        ...projectParams,
        tokenMetadata: {
          ...mockToken,
          fee,
        },
      },
    ]);

    const actualFeeTokens = get(snsSelectedTransactionFeeStore);

    expect(actualFeeTokens?.toE8s()).toBe(fee);
    expect(actualFeeTokens?.token.symbol).toBe(mockToken.symbol);
  });

  it("returns undefined if selected project is NNS", () => {
    setSnsProjects([projectParams]);
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

    const actualFeeTokens = get(snsSelectedTransactionFeeStore);

    expect(actualFeeTokens).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    page.mock({ data: { universe } });

    const actualFeeTokens = get(snsSelectedTransactionFeeStore);

    expect(actualFeeTokens).toBeUndefined();
  });
});
