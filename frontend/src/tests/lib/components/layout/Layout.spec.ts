import { layoutTitleStore } from "$lib/stores/layout.store";
import en from "$tests/mocks/i18n.mock";
import { fireEvent, render } from "@testing-library/svelte";
import LayoutTest from "./LayoutTest.svelte";

vi.mock("$lib/services/public/worker-metrics.services", () => ({
  initMetricsWorker: vi.fn(() =>
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
    beforeAll(() =>
      layoutTitleStore.set({
        title: "the header",
      })
    );

    afterAll(() => layoutTitleStore.set({ title: "" }));

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
    const spyBackClick = vi.fn();
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
