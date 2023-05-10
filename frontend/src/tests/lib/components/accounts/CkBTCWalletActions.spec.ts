import * as api from "$lib/api/ckbtc-minter.api";
import CkBTCWalletActions from "$lib/components/accounts/CkBTCWalletActions.svelte";
import {
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import en from "$tests/mocks/i18n.mock";
import { waitFor } from "@testing-library/dom";
import { fireEvent, render } from "@testing-library/svelte";
import { vi } from "vitest";
import { page } from "../../../../../__mocks__/$app/stores";

vi.mock("$lib/api/ckbtc-minter.api", () => ({
  updateBalance: vi.fn().mockResolvedValue(undefined),
}));

describe("CkBTCWalletActions", () => {
  beforeAll(() => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });
  });

  const props = {
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
    reload: () => Promise.resolve(),
  };

  it("should render action", () => {
    const { getByTestId } = render(CkBTCWalletActions, { props });

    const button = getByTestId("manual-refresh-balance");

    expect(button).not.toBeNull();
    expect(button?.textContent).toEqual(en.ckbtc.refresh_balance);
  });

  it("should call update balance", async () => {
    const spyUpdateBalance = vi.spyOn(api, "updateBalance");

    const { getByTestId } = render(CkBTCWalletActions, { props });

    const button = getByTestId("manual-refresh-balance");

    fireEvent.click(button as HTMLButtonElement);

    await waitFor(() => expect(spyUpdateBalance).toHaveBeenCalled());
  });

  it("should call reload", async () => {
    const spyReload = vi.fn();

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
