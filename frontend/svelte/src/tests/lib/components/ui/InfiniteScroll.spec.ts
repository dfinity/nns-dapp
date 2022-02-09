/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import InfiniteScroll from "../../../../lib/components/ui/InfiniteScroll.svelte";
import {IntersectionObserverActive, IntersectionObserverPassive} from '../../../mocks/infinitescroll.mock';
import InfiniteScrollTest from "./InfiniteScrollTest.svelte";

describe("InfiniteScroll", () => {
  // @ts-ignore
  beforeAll(() => (global.IntersectionObserver = IntersectionObserverActive));

  // @ts-ignore
  afterAll(() => (global.IntersectionObserver = IntersectionObserverPassive));

  it("should render a container", () => {
    const { container } = render(InfiniteScroll);

    expect(container.querySelector("div")).not.toBeNull();
  });

  it("should trigger an intersect event", () => {
    const spyIntersect = jest.fn();

    render(InfiniteScrollTest, {
      props: { elements: new Array(3), spy: spyIntersect },
    });

    expect(spyIntersect).toHaveBeenCalled();
  });
});
