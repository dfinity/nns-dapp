/**
 * @jest-environment jsdom
 */
import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
import { IC_LOGO } from "$lib/constants/icp.constants";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import { mockSummary } from "../../../mocks/sns-projects.mock";

describe("SelectUniverseCard", () => {
  const props = { summary: undefined, selected: false };

  describe("selected", () => {
    it("display a selected card", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, selected: true },
      });
      expect(container.querySelector(".selected")).not.toBeNull();
    });

    it("display a not selected card", () => {
      const { container } = render(SelectUniverseCard, {
        props,
      });
      expect(container.querySelector(".selected")).toBeNull();
    });
  });

  describe("theme", () => {
    it("display theme framed if role button", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, role: "button" },
      });
      expect(container.querySelector("article.framed")).not.toBeNull();
    });

    it("display theme transparent if role link", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, role: "link" },
      });
      expect(container.querySelector("article.transparent")).not.toBeNull();
    });

    it("display no theme if role dropdown", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, role: "dropdown" },
      });
      expect(container.querySelector("article.framed")).toBeNull();
      expect(container.querySelector("article.transparent")).toBeNull();
    });
  });

  describe("icon", () => {
    it("display an icon if role button and selected", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, role: "button", selected: true },
      });
      expect(container.querySelector("svg")).not.toBeNull();
    });

    it("display no icon if role button but not selected", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, role: "button", selected: false },
      });
      expect(container.querySelector("svg")).toBeNull();
    });

    it("display an icon if role dropdown", () => {
      const { container } = render(SelectUniverseCard, {
        props: { ...props, role: "dropdown" },
      });
      expect(container.querySelector("svg")).not.toBeNull();
    });
  });

  describe("nns", () => {
    it("should display ic logo", () => {
      const { getByTestId } = render(SelectUniverseCard, {
        props,
      });
      expect(getByTestId("logo")).not.toBeNull();
      expect(getByTestId("logo").getAttribute("src")).toEqual(IC_LOGO);
    });

    it("should display internet computer", () => {
      const { getByText } = render(SelectUniverseCard, {
        props,
      });
      expect(getByText(en.core.ic)).toBeInTheDocument();
    });
  });

  describe("sns", () => {
    it("should display logo", () => {
      const { getByTestId } = render(SelectUniverseCard, {
        props: { summary: mockSummary, selected: false },
      });
      expect(getByTestId("logo")).not.toBeNull();
      expect(getByTestId("logo").getAttribute("src")).toEqual(
        mockSummary.metadata.logo
      );
    });

    it("should display name", () => {
      const { getByText } = render(SelectUniverseCard, {
        props: { summary: mockSummary, selected: false },
      });
      expect(getByText(mockSummary.metadata.name)).toBeInTheDocument();
    });
  });
});
