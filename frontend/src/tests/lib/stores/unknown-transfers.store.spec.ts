import { LEDGER_DEDUPLICATION_WINDOW_NANOS } from "$lib/constants/accounts.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import {
  toTransferKey,
  unknownTransfersStore,
} from "$lib/stores/unknown-transfers.store";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { get } from "svelte/store";

describe("unknownTransfersStore", () => {
  const params = {
    ledgerCanisterId: "ledger",
    source: "source",
    destination: "destination",
    amount: 100n,
    fee: 10n,
  };
  const key = toTransferKey(params);
  const windowMillis = Number(LEDGER_DEDUPLICATION_WINDOW_NANOS / 1_000_000n);

  beforeEach(() => {
    vi.useFakeTimers({ now: 1_000_000_000_000, toFake: ["Date"] });
    unknownTransfersStore.resetForTesting();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("toTransferKey", () => {
    it.each([
      ["ledgerCanisterId", { ledgerCanisterId: "other" }],
      ["source", { source: "other" }],
      ["destination", { destination: "other" }],
      ["amount", { amount: 101n }],
      ["fee", { fee: 11n }],
      ["memo", { memo: "1" }],
    ])("should change with the %s", (_, change) => {
      expect(toTransferKey({ ...params, ...change })).not.toEqual(key);
    });
  });

  describe("startAttempt", () => {
    it("should use the current time for a new transfer", () => {
      expect(unknownTransfersStore.startAttempt(key)).toEqual({
        key,
        createdAt: nowInBigIntNanoSeconds(),
        isRetry: false,
      });
    });

    it("should reuse the timestamp of an unknown transfer", () => {
      const createdAt = nowInBigIntNanoSeconds();
      unknownTransfersStore.add({ key, createdAt });
      vi.setSystemTime(Date.now() + 1_000);

      expect(unknownTransfersStore.startAttempt(key)).toEqual({
        key,
        createdAt,
        isRetry: true,
      });
    });

    it("should use the current time at the end of the window", () => {
      unknownTransfersStore.add({
        key,
        createdAt: nowInBigIntNanoSeconds(),
      });
      vi.setSystemTime(Date.now() + windowMillis);

      expect(unknownTransfersStore.startAttempt(key)).toEqual({
        key,
        createdAt: nowInBigIntNanoSeconds(),
        isRetry: false,
      });
    });
  });

  it("should remove a transfer", () => {
    unknownTransfersStore.add({ key, createdAt: nowInBigIntNanoSeconds() });
    unknownTransfersStore.remove(key);

    expect(get(unknownTransfersStore)).toEqual({});
  });

  it("should drop expired transfers when it adds a transfer", () => {
    unknownTransfersStore.add({
      key: "expired",
      createdAt: nowInBigIntNanoSeconds(),
    });
    vi.setSystemTime(Date.now() + windowMillis);
    const createdAt = nowInBigIntNanoSeconds();
    unknownTransfersStore.add({ key, createdAt });

    expect(get(unknownTransfersStore)).toEqual({ [key]: createdAt });
  });

  it("should write to local storage", () => {
    unknownTransfersStore.add({ key: "key", createdAt: 5n });

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.UnknownTransfers)
    ).toContain("key");
  });
});
