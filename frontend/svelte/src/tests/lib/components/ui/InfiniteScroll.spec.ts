/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import InfiniteScroll from "../../../../lib/components/ui/InfiniteScroll.svelte";
import {
  DEFAULT_LIST_PAGINATION_LIMIT,
  INFINITE_SCROLL_OFFSET,
} from "../../../../lib/constants/constants";
import {
  IntersectionObserverActive,
  IntersectionObserverPassive,
} from "../../../mocks/infinitescroll.mock";
import InfiniteScrollTest from "./InfiniteScrollTest.svelte";

describe("InfiniteScroll", () => {
  // @ts-ignore: test file
  beforeAll(() => (global.IntersectionObserver = IntersectionObserverActive));

  // @ts-ignore: test file
  afterAll(() => (global.IntersectionObserver = IntersectionObserverPassive));

  it("should render a container", () => {
    const { container } = render(InfiniteScroll);

    expect(container.querySelector("ul")).not.toBeNull();
  });

  it("should trigger an intersect event", () => {
    const spyIntersect = jest.fn();

    render(InfiniteScrollTest, {
      props: {
        elements: new Array(DEFAULT_LIST_PAGINATION_LIMIT),
        spy: spyIntersect,
      },
    });

    expect(spyIntersect).toHaveBeenCalled();
  });

  it("should trigger an intersect event with custom page limit", () => {
    const spyIntersect = jest.fn();

    render(InfiniteScrollTest, {
      props: {
        pageLimit: 5,
        elements: new Array(5),
        spy: spyIntersect,
      },
    });

    expect(spyIntersect).toHaveBeenCalled();
  });

  it("should not trigger an intersect event", () => {
    const spyIntersect = jest.fn();

    render(InfiniteScrollTest, {
      props: {
        elements: new Array(DEFAULT_LIST_PAGINATION_LIMIT + 1),
        spy: spyIntersect,
      },
    });

    expect(spyIntersect).not.toHaveBeenCalled();
  });

  it("should not trigger an intersect event if more elements than offset but less than page", () => {
    const spyIntersect = jest.fn();

    /**
     * [0-100]
     * [101-121]
     *
     * Infinite scroll does not observe because all data are fetched.
     */
    render(InfiniteScrollTest, {
      props: {
        elements: new Array(
          DEFAULT_LIST_PAGINATION_LIMIT +
            Math.round(DEFAULT_LIST_PAGINATION_LIMIT * INFINITE_SCROLL_OFFSET) +
            1
        ),
        spy: spyIntersect,
      },
    });

    expect(spyIntersect).not.toHaveBeenCalled();
  });
});
