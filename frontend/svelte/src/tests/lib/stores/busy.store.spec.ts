import { get } from "svelte/store";
import { busyStore } from "../../../lib/stores/busy.store";

describe("busy.store", () => {
  it("should add initiator", async () => {
    busyStore.start("vote");
    expect(get(busyStore).size).toBe(1);
  });

  it("should add initiator only once", async () => {
    busyStore.start("vote");
    busyStore.start("vote");
    expect(get(busyStore).size).toBe(1);
  });

  it("should remove initiator", async () => {
    busyStore.start("vote");
    busyStore.start("test");
    busyStore.stop("vote");
    expect(get(busyStore).size).toBe(1);
  });
});
