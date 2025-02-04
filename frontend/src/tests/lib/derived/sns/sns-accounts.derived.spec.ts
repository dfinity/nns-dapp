import { snsAccountsStore } from "$lib/derived/sns/sns-accounts.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns-accounts.derived", () => {
  const batmanRootCanisterIdText = "aax3a-h4aaa-aaaaa-qaahq-cai";
  const batmanLedgerCanisterIdText = "c2lt4-zmaaa-aaaaa-qaaiq-cai";
  const robinRootCanisterIdText = "ctiya-peaaa-aaaaa-qaaja-cai";
  const robinLedgerCanisterIdText = "cpmcr-yeaaa-aaaaa-qaala-cai";

  const batmanAccounts = {
    accounts: [
      {
        ...mockSnsMainAccount,
        balanceUlps: 123_000n,
      },
    ],
    certified: true,
  };

  const robinAccounts = {
    accounts: [
      {
        ...mockSnsMainAccount,
        balanceUlps: 456_000n,
      },
    ],
    certified: true,
  };

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: Principal.fromText(batmanRootCanisterIdText),
        ledgerCanisterId: Principal.fromText(batmanLedgerCanisterIdText),
      },
      {
        rootCanisterId: Principal.fromText(robinRootCanisterIdText),
        ledgerCanisterId: Principal.fromText(robinLedgerCanisterIdText),
      },
    ]);
    icrcAccountsStore.set({
      ledgerCanisterId: Principal.fromText(batmanLedgerCanisterIdText),
      accounts: batmanAccounts,
    });
    icrcAccountsStore.set({
      ledgerCanisterId: Principal.fromText(robinLedgerCanisterIdText),
      accounts: robinAccounts,
    });
  });

  describe("snsAccountsStore", () => {
    it("hold SNS accounts by root canister ID", () => {
      const store = get(snsAccountsStore);
      expect(store).toEqual({
        [batmanRootCanisterIdText]: batmanAccounts,
        [robinRootCanisterIdText]: robinAccounts,
      });
    });
  });
});
