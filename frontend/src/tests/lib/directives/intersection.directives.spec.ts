import * as dispatchEvents from "$lib/utils/events.utils";
import {
  IntersectionObserverActive,
  mockIntersectionObserverIsIntersecting,
} from "$tests/mocks/infinitescroll.mock";
import { render } from "@testing-library/svelte";
import IntersectionTest from "./IntersectionTest.svelte";

describe("IntersectionDirectives", () => {
  beforeAll(() =>
    vi.stubGlobal("IntersectionObserver", IntersectionObserverActive)
  );

  afterAll(() => vi.unstubAllGlobals());

  let spy;
  let testIntersecting: boolean;

  beforeEach(
    () =>
      (spy = vi
        .spyOn(dispatchEvents, "dispatchIntersecting")
        .mockImplementation(
          ($event) => (testIntersecting = $event?.intersecting ?? false)
        ))
  );
  afterEach(() => vi.clearAllMocks());

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
