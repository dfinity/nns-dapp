/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Guard from "../../../../lib/components/common/Guard.svelte";
import { authStore } from "../../../../lib/stores/auth.store";

describe("Guard", () => {
  it("should render a spinner while loading", () => {
    // Promise that never resolves to test if a spinner is rendered while loading
    jest
      .spyOn(authStore, "sync")
      .mockImplementation(() => new Promise((resolve) => {}));

    const { container } = render(Guard);

    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("circle")).not.toBeNull();
  });

  it("should sync auth on localstorage changes", () => {
    const spy = jest
      .spyOn(authStore, "sync")
      .mockImplementation(() => Promise.resolve());

    render(Guard);

    window.localStorage.setItem("test", "test");

    expect(spy).toHaveBeenCalled();
  });
});
