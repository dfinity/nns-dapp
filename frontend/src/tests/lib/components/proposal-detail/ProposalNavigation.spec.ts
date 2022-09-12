/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProposalNavigation from "../../../../lib/components/proposal-detail/ProposalNavigation.svelte";
import { proposalsStore } from "../../../../lib/stores/proposals.store";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("ProposalNavigation", () => {
  const props = { proposalInfo: mockProposals[0] };

  describe("not rendered", () => {
    it("should not render buttons if no proposal", () => {
      proposalsStore.setProposals({ proposals: [], certified: true });

      const { getByTestId } = render(ProposalNavigation, {
        props,
      });

      expect(() => getByTestId("proposal-nav-previous")).toThrow();
      expect(() => getByTestId("proposal-nav-next")).toThrow();

      proposalsStore.setProposals({ proposals: [], certified: undefined });
    });

    it("should not render buttons if very last proposal", () => {
      proposalsStore.setProposals({
        proposals: [mockProposals[0]],
        certified: true,
      });

      const { getByTestId } = render(ProposalNavigation, {
        props,
      });

      expect(() => getByTestId("proposal-nav-previous")).toThrow();
      expect(() => getByTestId("proposal-nav-next")).toThrow();

      proposalsStore.setProposals({ proposals: [], certified: undefined });
    });
  });

  describe("display", () => {
    const propsPrevious = { proposalInfo: mockProposals[0] };
    const propsNext = { proposalInfo: mockProposals[1] };

    beforeAll(() =>
      proposalsStore.setProposals({ proposals: mockProposals, certified: true })
    );

    afterAll(() =>
      proposalsStore.setProposals({ proposals: [], certified: undefined })
    );

    it("should render buttons", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: propsPrevious,
      });

      expect(getByTestId("proposal-nav-previous")).not.toBeNull();
      expect(getByTestId("proposal-nav-next")).not.toBeNull();
    });

    it("should hide previous", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: propsPrevious,
      });

      expect(
        getByTestId("proposal-nav-previous")?.classList.contains("hidden")
      ).toBeTruthy();
    });

    it("should display next", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: propsPrevious,
      });

      expect(
        getByTestId("proposal-nav-next")?.classList.contains("hidden")
      ).not.toBeTruthy();
    });

    it("should hide previous", () => {
      const { getByTestId } = render(ProposalNavigation, { props: propsNext });

      expect(
        getByTestId("proposal-nav-previous")?.classList.contains("hidden")
      ).not.toBeTruthy();
    });

    it("should display next", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: propsNext,
      });

      expect(
        getByTestId("proposal-nav-next")?.classList.contains("hidden")
      ).toBeTruthy();
    });
  });
});
