import * as directives from "$lib/directives/intersection.directives";
import {
  IntersectionObserverActive,
  IntersectionObserverPassive,
  mockIntersectionObserverIsIntersecting,
} from "$tests/mocks/infinitescroll.mock";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";
import IntersectionTest from "./IntersectionTest.svelte";

describe("IntersectionDirectives", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: test file
  beforeAll(() => (global.IntersectionObserver = IntersectionObserverActive));

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: test file
  afterAll(() => (global.IntersectionObserver = IntersectionObserverPassive));

  let spy;
  let testIntersecting: boolean;

  beforeEach(
    () =>
      (spy = vi
        .spyOn(directives, "dispatchIntersecting")
        .mockImplementation(
          ({ intersecting }) => (testIntersecting = intersecting)
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
    expect(testIntersecting).toBeFalsy();
  });
});
