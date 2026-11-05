import { LEDGER_DEDUPLICATION_WINDOW_NANOS } from "$lib/constants/accounts.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import {
  clearTransferAttempt,
  startTransferAttempt,
  toTransferKey,
} from "$lib/utils/transfer-attempts.utils";
import { jsonReplacer } from "@dfinity/utils";

describe("transfer-attempts.utils", () => {
  const params = {
    ledgerCanisterId: "ledger",
    source: "source",
    destination: "destination",
    amount: 100n,
    fee: 10n,
  };
  const key = toTransferKey(params);
  const windowMillis = Number(LEDGER_DEDUPLICATION_WINDOW_NANOS / 1_000_000n);

  const saveFromOtherTab = (attempts: Record<string, bigint>) =>
    localStorage.setItem(
      StoreLocalStorageKey.TransferAttempts,
      JSON.stringify(attempts, jsonReplacer)
    );

  beforeEach(() => {
    vi.useFakeTimers({ now: 1_000_000_000_000, toFake: ["Date"] });
    localStorage.clear();
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

  describe("startTransferAttempt", () => {
    it("should use the current time for a new transfer", () => {
      expect(startTransferAttempt(key)).toEqual({
        key,
        createdAt: nowInBigIntNanoSeconds(),
        isRetry: false,
      });
    });

    it("should reuse the timestamp of a saved attempt", () => {
      const { createdAt } = startTransferAttempt(key);
      vi.setSystemTime(Date.now() + 1_000);

      expect(startTransferAttempt(key)).toEqual({
        key,
        createdAt,
        isRetry: true,
      });
    });

    it("should reuse the timestamp of an attempt from another tab", () => {
      saveFromOtherTab({ [key]: nowInBigIntNanoSeconds() });

      expect(startTransferAttempt(key).isRetry).toBe(true);
    });

    it("should keep the attempts of another tab", () => {
      startTransferAttempt(key);
      const createdAt = nowInBigIntNanoSeconds();
      saveFromOtherTab({ other: createdAt });
      startTransferAttempt(key);

      expect(startTransferAttempt("other")).toEqual({
        key: "other",
        createdAt,
        isRetry: true,
      });
    });

    it("should use the current time at the end of the window", () => {
      startTransferAttempt(key);
      vi.setSystemTime(Date.now() + windowMillis);

      expect(startTransferAttempt(key)).toEqual({
        key,
        createdAt: nowInBigIntNanoSeconds(),
        isRetry: false,
      });
    });

    it("should drop expired attempts", () => {
      startTransferAttempt("expired");
      vi.setSystemTime(Date.now() + windowMillis);
      startTransferAttempt(key);

      expect(
        localStorage.getItem(StoreLocalStorageKey.TransferAttempts)
      ).not.toContain("expired");
    });

    it("should work if local storage has invalid data", () => {
      vi.spyOn(console, "error").mockReturnValue();
      localStorage.setItem(StoreLocalStorageKey.TransferAttempts, "{");

      expect(startTransferAttempt(key).isRetry).toBe(false);
    });
  });

  describe("clearTransferAttempt", () => {
    it("should clear only the attempt of the key", () => {
      startTransferAttempt(key);
      startTransferAttempt("other");
      clearTransferAttempt(key);

      expect(startTransferAttempt(key).isRetry).toBe(false);
      expect(startTransferAttempt("other").isRetry).toBe(true);
    });
  });
});
