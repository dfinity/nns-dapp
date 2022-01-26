/**
 * @jest-environment jsdom
 */

import { authStore } from "../../../lib/stores/auth.store";
import { render } from "@testing-library/svelte";
import Guard from "../../../lib/components/Guard.svelte";

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
});
