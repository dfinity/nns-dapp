/**
 * @jest-environment jsdom
 */

import * as directives from "$lib/directives/intersection.directives";
import { render } from "@testing-library/svelte";
import {
  IntersectionObserverActive,
  IntersectionObserverPassive,
  mockIntersectionObserverIsIntersecting,
} from "../../mocks/infinitescroll.mock";
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
      (spy = jest
        .spyOn(directives, "dispatchIntersecting")
        .mockImplementation(
          ({ intersecting }) => (testIntersecting = intersecting)
        ))
  );
  afterEach(() => jest.clearAllMocks());

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
