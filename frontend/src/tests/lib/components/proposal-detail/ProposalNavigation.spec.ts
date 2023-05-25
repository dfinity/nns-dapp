/**
 * @jest-environment jsdom
 */

import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
import { fireEvent, render } from "@testing-library/svelte";

describe("ProposalNavigation", () => {
  describe("not rendered", () => {
    it("should not render buttons if no proposalIdString", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: {
          proposalIdString: undefined,
          proposalIds: ["1"],
        },
      });

      expect(() => getByTestId("proposal-nav-previous")).toThrow();
      expect(() => getByTestId("proposal-nav-next")).toThrow();
    });

    it("should not render buttons if no proposalIds", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: {
          proposalIdString: "1",
          proposalIds: undefined,
        },
      });

      expect(() => getByTestId("proposal-nav-previous")).toThrow();
      expect(() => getByTestId("proposal-nav-next")).toThrow();
    });

    it("should not render buttons if no proposalIdString in proposalIds", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: {
          proposalIdString: "1",
          proposalIds: ["0"],
        },
      });

      expect(() => getByTestId("proposal-nav-previous")).toThrow();
      expect(() => getByTestId("proposal-nav-next")).toThrow();
    });
  });

  describe("display", () => {
    it("should render buttons", async () => {
      const { getByTestId } = render(ProposalNavigation, {
        proposalIdString: "1",
        proposalIds: ["0", "1", "2"],
      });

      expect(getByTestId("proposal-nav-previous")).not.toBeNull();
      expect(getByTestId("proposal-nav-next")).not.toBeNull();
    });

    it("should hide previous", () => {
      const { getByTestId } = render(ProposalNavigation, {
        proposalIdString: "1",
        proposalIds: ["1", "2"],
      });

      expect(
        getByTestId("proposal-nav-previous")?.classList.contains("hidden")
      ).toBe(true);
      expect(
        getByTestId("proposal-nav-next")?.classList.contains("hidden")
      ).toBe(false);
    });

    it("should display next", () => {
      const { getByTestId } = render(ProposalNavigation, {
        proposalIdString: "1",
        proposalIds: ["0", "1"],
      });

      expect(
        getByTestId("proposal-nav-previous")?.classList.contains("hidden")
      ).toBe(false);
      expect(
        getByTestId("proposal-nav-next")?.classList.contains("hidden")
      ).toBe(true);
    });
  });

  describe("action", () => {
    it("should emmit next click", async () => {
      const nnsNavigationSpy = jest.fn();
      const { getByTestId, component } = render(ProposalNavigation, {
        proposalIdString: "1",
        proposalIds: ["0", "1", "2"],
      });

      component.$on("nnsNavigation", nnsNavigationSpy);
      const btn = getByTestId("proposal-nav-next") as HTMLButtonElement;

      fireEvent.click(btn);

      expect(nnsNavigationSpy).toHaveBeenCalledTimes(1);
      expect(nnsNavigationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "2",
        })
      );
    });

    it("should emmit previous click", async () => {
      const nnsNavigationSpy = jest.fn();
      const { getByTestId, component } = render(ProposalNavigation, {
        proposalIdString: "1",
        proposalIds: ["0", "1", "2"],
      });

      component.$on("nnsNavigation", nnsNavigationSpy);
      const btn = getByTestId("proposal-nav-previous") as HTMLButtonElement;

      fireEvent.click(btn);

      expect(nnsNavigationSpy).toHaveBeenCalledTimes(1);
      expect(nnsNavigationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "0",
        })
      );
    });
  });
});
