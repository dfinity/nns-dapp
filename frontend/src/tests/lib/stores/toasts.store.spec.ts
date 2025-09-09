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

  it("should avoid duplicates", () => {
    expect(get(toastsStore).length).toEqual(0);

    toastsStore.show({
      level: "success",
      text: "test",
    });

    expect(get(toastsStore).length).toEqual(1);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "test",
      },
    ]);

    toastsStore.show({
      level: "error",
      text: "test",
    });

    expect(get(toastsStore).length).toEqual(2);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "test",
      },
      {
        level: "error",
        text: "test",
      },
    ]);
  });
});
