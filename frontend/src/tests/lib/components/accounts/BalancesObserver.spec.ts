import BalancesObserver from "$lib/components/accounts/BalancesObserver.svelte";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import type { BalancesObserverData } from "$lib/types/icrc.observer";
import type { PostMessageDataRequestBalances } from "$lib/types/post-message.balances";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { ledgerCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render, waitFor } from "@testing-library/svelte";

let spyPostMessage;

vi.mock("$lib/workers/balances.worker?worker", () => ({
  default: class BalancesWorker {
    postMessage(data: {
      msg: "nnsStartBalancesTimer" | "nnsStopBalancesTimer";
      data?: PostMessageDataRequestBalances;
    }) {
      spyPostMessage(data);
    }
  },
}));

describe("IcrcBalancesObserver", () => {
  beforeEach(() => {
    spyPostMessage = vi.fn();
  });

  const data: BalancesObserverData = {
    ledgerCanisterId: ledgerCanisterIdMock.toText(),
    accounts: [mockMainAccount],
  };

  it("should init worker with parameters", async () => {
    render(BalancesObserver, {
      props: {
        data,
        callback: vi.fn(),
      },
    });

    await waitFor(() =>
      expect(spyPostMessage).toBeCalledWith({
        msg: "nnsStartBalancesTimer",
        data: {
          ledgerCanisterId: data.ledgerCanisterId,
          accountIdentifiers: data.accounts.map(({ identifier }) => identifier),
          host: HOST,
          fetchRootKey: FETCH_ROOT_KEY,
        },
      })
    );
  });

  it("should stop worker on destroy", async () => {
    const { unmount } = render(BalancesObserver, {
      props: {
        data,
        callback: vi.fn(),
      },
    });

    await waitFor(() => expect(spyPostMessage).toHaveBeenCalledTimes(1));

    unmount();

    await waitFor(() => expect(spyPostMessage).toHaveBeenCalledTimes(2));

    expect(spyPostMessage).toBeCalledWith({
      msg: "nnsStopBalancesTimer",
    });
  });
});
