/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Layout from "../../../../lib/components/common/Layout.svelte";
import en from "../../../mocks/i18n.mock";
import LayoutTest from "./LayoutTest.svelte";

describe("Layout", () => {
  describe("Main layout", () => {
    it("should render a menu button", () => {
      const { getByTestId } = render(Layout);
      const button = getByTestId("menu");
      expect(button).not.toBeNull();
      expect(button).toBeVisible();
      expect(button.getAttribute("aria-label")).toEqual(en.header.menu);
    });
  });

  describe("Detail layout", () => {
    const spyBackClick = jest.fn();
    let container, getByText;

    beforeEach(() => {
      const rendered = render(LayoutTest, {
        props: {
          header: "the header",
          content: "the content",
          button: "the button",
          spy: spyBackClick,
        },
      });
      container = rendered.container;
      getByText = rendered.getByText;
    });

    it("should render a header", () => {
      expect(getByText("the header")).toBeInTheDocument();
    });

    it("should render a content", () => {
      expect(getByText("the content")).toBeInTheDocument();
    });

    it("should render a button in the footer", () => {
      expect(
        container.querySelector("footer").querySelector("button").innerHTML
      ).toBe("the button");
    });

    it("should contain a back button tooltip", () => {
      expect(
        container.querySelector(".tooltip-wrapper button.back")
      ).toBeInTheDocument();
    });

    it("should dispatch on back click", () => {
      const button = container.querySelector("button.back");
      fireEvent.click(button);
      expect(spyBackClick).toBeCalled();
    });
  });
});
