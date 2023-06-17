import {
  bitcoinAddressStore,
  bitcoinConvertBlockIndexes,
} from "$lib/stores/bitcoin.store";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { get } from "svelte/store";

describe("bitcoin-store", () => {
  describe("Bitcoin address store", () => {
    beforeEach(() => bitcoinAddressStore.reset());

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

  describe("Bitcoin convert block indexed store", () => {
    beforeEach(() => bitcoinConvertBlockIndexes.reset());

    it("should add block indexes", () => {
      const store = get(bitcoinConvertBlockIndexes);
      expect(store.length).toEqual(0);

      bitcoinConvertBlockIndexes.addBlockIndex(123n);
      const store2 = get(bitcoinConvertBlockIndexes);
      expect(store2[0]).toEqual(123n);

      bitcoinConvertBlockIndexes.addBlockIndex(456n);
      const store3 = get(bitcoinConvertBlockIndexes);
      expect(store3[0]).toEqual(123n);
      expect(store3[1]).toEqual(456n);
      expect(store3.length).toEqual(2);
    });

    it("should remove block indexes", () => {
      const store = get(bitcoinConvertBlockIndexes);
      expect(store.length).toEqual(0);

      bitcoinConvertBlockIndexes.addBlockIndex(123n);
      bitcoinConvertBlockIndexes.addBlockIndex(456n);

      const store2 = get(bitcoinConvertBlockIndexes);
      expect(store2.length).toEqual(2);

      bitcoinConvertBlockIndexes.removeBlockIndex(123n);
      const store3 = get(bitcoinConvertBlockIndexes);
      expect(store3[0]).toEqual(456n);
      expect(store3.length).toEqual(1);
    });

    it("should reset block indexes", () => {
      const store = get(bitcoinConvertBlockIndexes);
      expect(store.length).toEqual(0);

      bitcoinConvertBlockIndexes.addBlockIndex(123n);
      bitcoinConvertBlockIndexes.addBlockIndex(456n);

      const store2 = get(bitcoinConvertBlockIndexes);
      expect(store2.length).toEqual(2);

      bitcoinConvertBlockIndexes.reset();
      const store3 = get(bitcoinConvertBlockIndexes);
      expect(store3.length).toEqual(0);
    });
  });
});
