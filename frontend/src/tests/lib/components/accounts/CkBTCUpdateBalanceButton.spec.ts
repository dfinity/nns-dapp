import * as api from "$lib/api/ckbtc-minter.api";
import CkBTCUpdateBalanceButton from "$lib/components/accounts/CkBTCUpdateBalanceButton.svelte";
import {
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { WALLET_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/wallet.constants";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { MinterNoNewUtxosError } from "@dfinity/ckbtc";
import { waitFor } from "@testing-library/dom";
import { fireEvent, render } from "@testing-library/svelte";

describe("CkBTCUpdateBalanceButton", () => {
  const now = Date.now();

  beforeAll(() => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });
  });

  beforeEach(() => {
    resetIdentity();
    vi.useFakeTimers().setSystemTime(now);
    vi.spyOn(api, "updateBalance").mockRejectedValue(
      new MinterNoNewUtxosError({
        required_confirmations: 12,
        pending_utxos: [],
      })
    );
  });
  afterEach(() => {
    vi.clearAllTimers();
  });

  const props = {
    universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
    reload: () => Promise.resolve(),
  };

  it("should render action", () => {
    const { getByTestId } = render(CkBTCUpdateBalanceButton, { props });

    const button = getByTestId("manual-refresh-balance");

    expect(button).not.toBeNull();
    expect(button?.textContent).toEqual(en.ckbtc.refresh_balance);
  });

  it("should call update balance", async () => {
    const spyUpdateBalance = vi.spyOn(api, "updateBalance");

    const { getByTestId } = render(CkBTCUpdateBalanceButton, { props });

    const button = getByTestId("manual-refresh-balance");

    await fireEvent.click(button as HTMLButtonElement);

    // wait for 4 seconds
    await advanceTime(WALLET_TRANSACTIONS_RELOAD_DELAY);

    await waitFor(() => expect(spyUpdateBalance).toHaveBeenCalledTimes(1));
  });

  it("should call reload", async () => {
    const spyReload = vi.fn();

    const { getByTestId } = render(CkBTCUpdateBalanceButton, {
      props: {
        ...props,
        reload: spyReload,
      },
    });

    expect(spyReload).not.toHaveBeenCalled();

    const button = getByTestId("manual-refresh-balance");

    await fireEvent.click(button as HTMLButtonElement);

    // wait for 4 seconds
    await advanceTime(WALLET_TRANSACTIONS_RELOAD_DELAY);

    await waitFor(() => expect(spyReload).toHaveBeenCalled());
  });
});
