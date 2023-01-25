/**
 * @jest-environment jsdom
 */

import { layoutTitleStore } from "$lib/stores/layout.store";
import { fireEvent, render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import LayoutTest from "./LayoutTest.svelte";

jest.mock("$lib/services/$public/worker-metrics.services", () => ({
  initMetricsWorker: jest.fn(() =>
    Promise.resolve({
      startMetricsTimer: () => {
        // Do nothing
      },
      stopMetricsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("Layout", () => {
  describe("Main layout", () => {
    beforeAll(() => layoutTitleStore.set("the header"));

    afterAll(() => layoutTitleStore.set(""));

    it("should render a menu button", () => {
      const { getByTestId } = render(LayoutTest, { props: { spy: undefined } });
      const button = getByTestId("menu-toggle");
      expect(button).not.toBeNull();
      expect(button).toBeVisible();
      expect(button.getAttribute("aria-label")).toEqual(en.header.menu);
    });

    it("should render a header", () => {
      const { getByText } = render(LayoutTest);

      expect(getByText("the header")).toBeInTheDocument();
    });
  });

  describe("Detail layout", () => {
    const spyBackClick = jest.fn();
    let container, getByText, queryByTestId;

    beforeEach(() => {
      const rendered = render(LayoutTest, {
        props: {
          content: "the content",
          spy: spyBackClick,
        },
      });
      container = rendered.container;
      getByText = rendered.getByText;
      queryByTestId = rendered.queryByTestId;
    });

    it("should render a content", () => {
      expect(getByText("the content")).toBeInTheDocument();
    });

    it("should contain a back button", () => {
      expect(queryByTestId("back")).toBeInTheDocument();
    });

    it("should dispatch on back click", () => {
      const button = container.querySelector("button.back");
      fireEvent.click(button);
      expect(spyBackClick).toBeCalled();
    });
  });
});
