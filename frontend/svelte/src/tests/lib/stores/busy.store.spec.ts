import { get } from "svelte/store";
import { busy, startBusy, stopBusy } from "../../../lib/stores/busy.store";

describe("busy.store", () => {
  it("should add initiator", () => {
    startBusy("vote");
    expect(get(busy)).toBe(true);
  });

  it("should add initiator only once", () => {
    startBusy("vote");
    startBusy("vote");
    expect(get(busy)).toBe(true);
  });

  it("should remove initiator", () => {
    startBusy("vote");
    startBusy("accounts");
    stopBusy("vote");
    expect(get(busy)).toBe(true);

    // cleanup for next test
    stopBusy("accounts");
  });

  it("should derive a busy state", () => {
    startBusy("vote");
    expect(get(busy)).toBe(true);
    stopBusy("vote");
    expect(get(busy)).toBe(false);
    startBusy("vote");
    startBusy("accounts");
    expect(get(busy)).toBe(true);
    stopBusy("vote");
    expect(get(busy)).toBe(true);
    stopBusy("accounts");
    expect(get(busy)).toBe(false);
  });
});
