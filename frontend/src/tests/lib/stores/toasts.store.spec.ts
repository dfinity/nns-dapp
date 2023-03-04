import { toastsClean } from "$lib/stores/toasts.store";
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";

describe("toast store", () => {
  it("should clean toasts", () => {
    toastsStore.show({
      level: "success",
      text: "test",
    });

    toastsStore.show({
      level: "success",
      text: "test",
    });

    toastsStore.show({
      level: "warn",
      text: "test",
    });

    toastsStore.show({
      level: "warn",
      text: "test",
    });

    toastsStore.show({
      level: "error",
      text: "test",
    });

    toastsStore.show({
      level: "info",
      text: "test",
    });

    toastsStore.show({
      level: "custom",
      text: "test",
    });

    toastsClean();

    const msgs = get(toastsStore);

    // Remain one error and one custom
    expect(msgs.length).toEqual(2);
  });
});
