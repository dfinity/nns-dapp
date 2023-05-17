/**
 * @jest-environment jsdom
 */

import * as ckbtcIndexApi from "$lib/api/ckbtc-index.api";
import * as api from "$lib/api/ckbtc-minter.api";
import CkBTCWalletActions from "$lib/components/accounts/CkBTCWalletActions.svelte";
import {
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { waitFor } from "@testing-library/dom";
import { fireEvent, render } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";

jest.mock("$lib/api/ckbtc-minter.api", () => ({
  updateBalance: jest.fn().mockResolvedValue(undefined),
}));

describe("CkBTCWalletActions", () => {
  beforeAll(() => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });
  });

  beforeEach(() => jest.clearAllMocks());

  const props = {
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
    reload: () => Promise.resolve(),
    indexCanisterId: mockPrincipal,
    universeId: mockPrincipal,
    account: mockCkBTCMainAccount,
  };

  it("should render action", () => {
    const { getByTestId } = render(CkBTCWalletActions, { props });

    const button = getByTestId("manual-refresh-balance");

    expect(button).not.toBeNull();
    expect(button?.textContent).toEqual(en.ckbtc.refresh_balance);
  });

  it("should render a menubar", () => {
    const { getByTestId } = render(CkBTCWalletActions, { props });
    expect(
      getByTestId("manual-refresh-balance-container")?.getAttribute("role")
    ).toEqual("menubar");
  });

  it("should not render a menubar", () => {
    const { getByTestId } = render(CkBTCWalletActions, {
      props: {
        ...props,
        inline: true,
      },
    });
    expect(
      getByTestId("manual-refresh-balance-container")?.hasAttribute("role")
    ).toEqual(false);
  });

  it("should call update balance and get transactions", async () => {
    const spyUpdateBalance = jest.spyOn(api, "updateBalance");
    const spyUpdateTransactions = jest
      .spyOn(ckbtcIndexApi, "getCkBTCTransactions")
      .mockResolvedValue({
        oldestTxId: BigInt(1234),
        transactions: [mockIcrcTransactionWithId],
      });

    const { getByTestId } = render(CkBTCWalletActions, { props });

    const button = getByTestId("manual-refresh-balance");

    expect(spyUpdateBalance).not.toHaveBeenCalled();
    expect(spyUpdateTransactions).not.toHaveBeenCalled();

    await fireEvent.click(button as HTMLButtonElement);

    await waitFor(() => expect(spyUpdateBalance).toHaveBeenCalled());
    await waitFor(() => expect(spyUpdateTransactions).toHaveBeenCalled());
  });

  it("should call reload", async () => {
    const spyReload = jest.fn();

    const { getByTestId } = render(CkBTCWalletActions, {
      props: {
        ...props,
        reload: spyReload,
      },
    });

    const button = getByTestId("manual-refresh-balance");

    fireEvent.click(button as HTMLButtonElement);

    await waitFor(() => expect(spyReload).toHaveBeenCalled());
  });
});
