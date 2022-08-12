import { get } from "svelte/store";
import { busy, startBusy, stopBusy } from "../../../lib/stores/busy.store";

describe("busy.store", () => {
  it("should add initiator", () => {
    startBusy({ initiator: "stake-neuron" });
    expect(get(busy)).toBe(true);
  });

  it("should add initiator only once", () => {
    startBusy({ initiator: "stake-neuron" });
    startBusy({ initiator: "stake-neuron" });
    expect(get(busy)).toBe(true);
  });

  it("should remove initiator", () => {
    startBusy({ initiator: "stake-neuron" });
    startBusy({ initiator: "accounts" });
    stopBusy("stake-neuron");
    expect(get(busy)).toBe(true);

    // cleanup for next test
    stopBusy("accounts");
  });

  it("should derive a busy state", () => {
    startBusy({ initiator: "stake-neuron" });
    expect(get(busy)).toBe(true);
    stopBusy("stake-neuron");
    expect(get(busy)).toBe(false);
    startBusy({ initiator: "stake-neuron" });
    startBusy({ initiator: "accounts" });
    expect(get(busy)).toBe(true);
    stopBusy("stake-neuron");
    expect(get(busy)).toBe(true);
    stopBusy("accounts");
    expect(get(busy)).toBe(false);
  });
});
