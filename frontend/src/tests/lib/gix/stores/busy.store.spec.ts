import {
  busyMessage,
  busyStore,
  startBusy,
  stopBusy,
} from "$lib/gix/stores/busy.store";
import { get } from "svelte/store";

describe("busy-store", () => {
  beforeEach(() => busyStore.resetForTesting());

  describe("busyMessage", () => {
    let unsubscribe: () => void;
    let message: string | undefined;

    beforeEach(() => {
      unsubscribe = busyMessage.subscribe((value) => (message = value));
    });

    afterEach(() => unsubscribe());

    it("should return the newest message", () => {
      startBusy({ initiator: "a", text: "textA" });
      startBusy({ initiator: "b", text: "textB" });
      startBusy({ initiator: "c" });

      expect(message).toBe("textB");
    });

    it("should return the previous message when the newest initiator stops", () => {
      startBusy({ initiator: "a", text: "textA" });
      startBusy({ initiator: "b", text: "textB" });
      startBusy({ initiator: "c", text: "textC" });

      expect(message).toBe("textC");

      stopBusy("c");

      expect(message).toBe("textB");
    });

    it("should not change the order of the store", () => {
      startBusy({ initiator: "a", text: "textA" });
      startBusy({ initiator: "b", text: "textB" });
      startBusy({ initiator: "c" });

      expect(get(busyStore).map(({ initiator }) => initiator)).toEqual([
        "a",
        "b",
        "c",
      ]);
    });
  });
});
