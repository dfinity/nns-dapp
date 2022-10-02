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
      .mockImplementation(() => new Promise(() => undefined));

    const { container } = render(Guard);

    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("circle")).not.toBeNull();
  });
});
