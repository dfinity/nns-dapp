import { toastsStore } from "$lib/gix/stores/toasts.store";
import { get } from "svelte/store";

describe("toasts-store", () => {
  it("should reset selected toast", () => {
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

    toastsStore.reset(["error", "warn"]);

    const msgs = get(toastsStore);

    expect(msgs).toHaveLength(3);
  });
});
