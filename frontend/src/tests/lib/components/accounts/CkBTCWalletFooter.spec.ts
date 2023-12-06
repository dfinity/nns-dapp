import CkBTCWalletFooter from "$lib/components/accounts/CkBTCWalletFooter.svelte";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import CkBTCWalletContextTest from "./CkBTCWalletContextTest.svelte";

vi.mock("$lib/api/ckbtc-minter.api", () => {
  return {
    getBTCAddress: vi.fn().mockImplementation(() => mockBTCAddressTestnet),
  };
});

describe("CkBTCWalletFooter", () => {
  beforeEach(() => {
    resetIdentity();
    vi.spyOn(tokensStore, "subscribe").mockImplementation(
      mockTokensSubscribe(mockUniversesTokens)
    );

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });
  });

  const renderFooter = (account?: Account) =>
    render(CkBTCWalletContextTest, {
      props: {
        account,
        testComponent: CkBTCWalletFooter,
      },
    });

  it("should render a receive button", () => {
    const { getByTestId } = renderFooter(mockCkBTCMainAccount);

    expect(getByTestId("receive-ckbtc")).not.toBeNull();
  });

  it("should render a disabled receive button if not account", () => {
    const { getByTestId } = renderFooter(undefined);

    expect(
      getByTestId("receive-ckbtc").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("should open receive modal", async () => {
    const { getByTestId, container } = renderFooter(mockCkBTCMainAccount);

    fireEvent.click(getByTestId("receive-ckbtc") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });

  it("should open transaction modal", async () => {
    const { getByTestId, container } = renderFooter(mockCkBTCMainAccount);

    fireEvent.click(getByTestId("open-ckbtc-transaction") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });
});
