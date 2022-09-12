/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProposalNavigation from "../../../../lib/components/proposal-detail/ProposalNavigation.svelte";
import { proposalsStore } from "../../../../lib/stores/proposals.store";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("ProposalNavigation", () => {
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

    it("should render next", () => {
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

    it("should render next", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props: propsNext,
      });

      expect(
        getByTestId("proposal-nav-next")?.classList.contains("hidden")
      ).toBeTruthy();
    });
  });
});
