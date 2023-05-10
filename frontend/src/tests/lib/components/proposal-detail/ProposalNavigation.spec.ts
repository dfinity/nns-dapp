import { page } from "$app/stores";
import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { proposalsStore } from "$lib/stores/proposals.store";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

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

  describe("action", () => {
    const props = { proposalInfo: mockProposals[1] };
    const proposalId = BigInt(202);

    beforeAll(() =>
      proposalsStore.setProposals({
        proposals: [...mockProposals, { ...mockProposals[0], id: proposalId }],
        certified: true,
      })
    );

    afterAll(() =>
      proposalsStore.setProposals({ proposals: [], certified: undefined })
    );

    it("should go to next", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props,
      });

      const btn = getByTestId("proposal-nav-next") as HTMLButtonElement;
      fireEvent.click(btn);

      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Proposal);

      const {
        data: { proposal },
      } = get(page);
      expect(proposal).toEqual(`${proposalId}`);
    });

    it("should go to previous", () => {
      const { getByTestId } = render(ProposalNavigation, {
        props,
      });

      const btn = getByTestId("proposal-nav-previous") as HTMLButtonElement;
      fireEvent.click(btn);

      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Proposal);

      const {
        data: { proposal },
      } = get(page);
      expect(proposal).toEqual(`${mockProposals[0].id}`);
    });
  });
});
