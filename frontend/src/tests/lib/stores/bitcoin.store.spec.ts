import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { get } from "svelte/store";

describe("bitcoin-store", () => {
  describe("Bitcoin address store", () => {
    const data = {
      identifier: mockCkBTCMainAccount.identifier,
      btcAddress: mockBTCAddressTestnet,
    };

    it("should set address", () => {
      bitcoinAddressStore.set(data);

      const store = get(bitcoinAddressStore);
      expect(store[mockCkBTCMainAccount.identifier]).toEqual(
        mockBTCAddressTestnet
      );
    });

    it("should reset address", () => {
      bitcoinAddressStore.set(data);

      bitcoinAddressStore.reset();

      const store = get(bitcoinAddressStore);
      expect(store[mockCkBTCMainAccount.identifier]).toBeUndefined();
    });
  });
});
