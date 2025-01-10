import * as dispatchEvents from "$lib/utils/events.utils";
import IntersectionTest from "$tests/lib/directives/IntersectionTest.svelte";
import {
  IntersectionObserverActive,
  mockIntersectionObserverIsIntersecting,
} from "$tests/mocks/infinitescroll.mock";
import { render } from "@testing-library/svelte";

describe("IntersectionDirectives", () => {
  let spy;
  let testIntersecting: boolean;

  beforeEach(() => {
    spy = vi
      .spyOn(dispatchEvents, "dispatchIntersecting")
      .mockImplementation(
        ($event) => (testIntersecting = $event?.intersecting ?? false)
      );
    vi.stubGlobal("IntersectionObserver", IntersectionObserverActive);
  });

  it("should trigger an intersect event", () => {
    render(IntersectionTest);

    expect(spy).toHaveBeenCalled();
    expect(testIntersecting).toBeTruthy();
  });

  it("should not trigger an intersect event", () => {
    mockIntersectionObserverIsIntersecting(false);

    render(IntersectionTest);

    expect(spy).toHaveBeenCalled();
    expect(testIntersecting).toBe(false);
  });
});
