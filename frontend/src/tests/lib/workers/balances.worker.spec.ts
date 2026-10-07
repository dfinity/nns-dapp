import { SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS } from "$lib/constants/accounts.constants";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessage } from "$lib/types/post-messages";
import type { GetAccountsBalanceData } from "$lib/worker-services/icrc-balances.worker-services";
import { getIcrcAccountsBalances } from "$lib/worker-services/icrc-balances.worker-services";
import "$lib/workers/balances.worker";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import { AuthClient } from "@icp-sdk/auth/client";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/worker-services/icrc-balances.worker-services", () => ({
  getIcrcAccountsBalances: vi.fn(),
}));

describe("balances.worker", () => {
  const accountIdentifier1 =
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f";
  const accountIdentifier2 =
    "5b315d2f6702cb3a27d826161797d7b2c2e131cd312aece51d4d5d4d47f04e0e";

  const startData: PostMessageDataRequestBalances = {
    accountIdentifiers: [accountIdentifier1],
    ledgerCanisterId: "mxzaz-hqaaa-aaaar-qaada-cai",
    host: "https://icp-api.io",
    fetchRootKey: false,
  };

  const balanceData = ({
    key,
    balance,
  }: {
    key: string;
    balance: bigint;
  }): GetAccountsBalanceData => ({
    key,
    balance,
    certified: true,
  });

  let spyPostMessage: ReturnType<typeof vi.fn>;

  // The worker module assigns the global `onmessage` handler when it is
  // imported. This is how the main thread talks to it.
  const postMessageToWorker = async (
    msg: "nnsStartBalancesTimer" | "nnsStopBalancesTimer"
  ): Promise<void> =>
    await (
      globalThis.onmessage as unknown as (event: {
        data: PostMessage<PostMessageDataRequestBalances>;
      }) => Promise<void>
    )({ data: { msg, data: startData } });

  const startWorker = (): Promise<void> =>
    postMessageToWorker("nnsStartBalancesTimer");

  // The worker module is a singleton. Every test must stop the timer and reset
  // the store, otherwise the next test inherits both.
  const runAndStopWorker = async (test: () => Promise<void>): Promise<void> => {
    try {
      await test();
    } finally {
      await postMessageToWorker("nnsStopBalancesTimer");
    }
  };

  const postedMessages = (msg: string): { data: unknown }[] =>
    spyPostMessage.mock.calls
      .map(([message]) => message)
      .filter((message) => message.msg === msg);

  const syncBalancesMessages = (): PostMessageDataResponseBalances[] =>
    postedMessages("nnsSyncBalances").map(
      ({ data }) => data as PostMessageDataResponseBalances
    );

  const certifiedParamsOfCalls = (): boolean[] =>
    vi
      .mocked(getIcrcAccountsBalances)
      .mock.calls.map(([{ certified }]) => certified);

  beforeEach(() => {
    vi.useFakeTimers();

    spyPostMessage = vi.fn();
    global.postMessage = spyPostMessage as unknown as typeof global.postMessage;

    const mockAuthClient = mock<AuthClient>();
    mockAuthClient.isAuthenticated.mockResolvedValue(true);
    mockAuthClient.getIdentity.mockResolvedValue(mockIdentity as never);
    vi.spyOn(AuthClient, "create").mockImplementation(
      async (): Promise<AuthClient> => mockAuthClient
    );
  });

  it("should only make a certified call on start", () =>
    runAndStopWorker(async () => {
      vi.mocked(getIcrcAccountsBalances).mockResolvedValue([
        balanceData({ key: accountIdentifier1, balance: 100n }),
      ]);

      await startWorker();

      expect(getIcrcAccountsBalances).toHaveBeenCalledTimes(1);
      expect(getIcrcAccountsBalances).toHaveBeenCalledWith({
        identity: mockIdentity,
        data: startData,
        certified: true,
      });
      expect(certifiedParamsOfCalls()).toEqual([true]);

      expect(syncBalancesMessages()).toEqual([
        {
          balances: [{ accountIdentifier: accountIdentifier1, balance: 100n }],
        },
      ]);
    }));

  it("should make a certified call on the next tick when the balance does not change", () =>
    runAndStopWorker(async () => {
      vi.mocked(getIcrcAccountsBalances).mockResolvedValue([
        balanceData({ key: accountIdentifier1, balance: 100n }),
      ]);

      await startWorker();

      expect(certifiedParamsOfCalls()).toEqual([true]);
      expect(syncBalancesMessages()).toHaveLength(1);

      await advanceTime(SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS);

      // The second tick must read the ledger with a certified call. Otherwise a
      // replica that echoes the last balance in a query answer stops every
      // further certified read for the whole session.
      expect(certifiedParamsOfCalls()).toEqual([true, true]);

      // The balance did not change, so the worker emits nothing new.
      expect(syncBalancesMessages()).toHaveLength(1);
    }));

  it("should emit the new balance when the certified balance changes", () =>
    runAndStopWorker(async () => {
      vi.mocked(getIcrcAccountsBalances).mockResolvedValue([
        balanceData({ key: accountIdentifier1, balance: 100n }),
      ]);

      await startWorker();

      vi.mocked(getIcrcAccountsBalances).mockResolvedValue([
        balanceData({ key: accountIdentifier1, balance: 200n }),
      ]);

      await advanceTime(SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS);

      expect(certifiedParamsOfCalls()).toEqual([true, true]);
      expect(syncBalancesMessages()).toEqual([
        {
          balances: [{ accountIdentifier: accountIdentifier1, balance: 100n }],
        },
        {
          balances: [{ accountIdentifier: accountIdentifier1, balance: 200n }],
        },
      ]);
    }));

  it("should emit only the accounts whose certified balance changed", () =>
    runAndStopWorker(async () => {
      vi.mocked(getIcrcAccountsBalances).mockResolvedValue([
        balanceData({ key: accountIdentifier1, balance: 100n }),
        balanceData({ key: accountIdentifier2, balance: 300n }),
      ]);

      await startWorker();

      vi.mocked(getIcrcAccountsBalances).mockResolvedValue([
        balanceData({ key: accountIdentifier1, balance: 100n }),
        balanceData({ key: accountIdentifier2, balance: 400n }),
      ]);

      await advanceTime(SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS);

      expect(syncBalancesMessages()).toEqual([
        {
          balances: [
            { accountIdentifier: accountIdentifier1, balance: 100n },
            { accountIdentifier: accountIdentifier2, balance: 300n },
          ],
        },
        {
          balances: [{ accountIdentifier: accountIdentifier2, balance: 400n }],
        },
      ]);
    }));

  it("should post an error message when the certified call fails", () =>
    runAndStopWorker(async () => {
      silentConsoleErrors();

      const error = new Error("Ledger unreachable");
      vi.mocked(getIcrcAccountsBalances).mockRejectedValue(error);

      await startWorker();

      expect(postedMessages("nnsSyncErrorBalances")).toEqual([
        { msg: "nnsSyncErrorBalances", data: error },
      ]);
      expect(syncBalancesMessages()).toHaveLength(0);
    }));
});
