import ProposalNavigation from "$lib/components/proposal-detail/ProposalNavigation.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { ProposalsNavigationId } from "$lib/types/proposals";
import { page } from "$mocks/$app/stores";
import { ProposalNavigationPo } from "$tests/page-objects/ProposalNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ProposalNavigation", () => {
  const toNavigationId = (proposalId: bigint): ProposalsNavigationId => ({
    proposalId,
    universe: OWN_CANISTER_ID_TEXT,
  });
  const renderComponent = (props) => {
    const { container } = render(ProposalNavigation, { props });
    return ProposalNavigationPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    // for logo
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  describe("ENABLE_FULL_WIDTH_PROPOSAL enabled", () => {
    describe("not rendered", () => {
      it("should render universe logo", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.getLogoSource()).toEqual(
          "/src/lib/assets/icp-rounded.svg"
        );
      });

      it("should render proposal status", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.getProposalStatus()).toEqual("Open");
      });

      it("should render proposal title", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.getTitle()).toEqual("Title");
      });

      it("should hide buttons if no proposalIds", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.isNextButtonHidden()).toBe(true);
        expect(await po.isPreviousButtonHidden()).toBe(true);
      });
    });

    describe("display", () => {
      it("should render buttons", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: [
            toNavigationId(2n),
            toNavigationId(1n),
            toNavigationId(0n),
          ],
          selectProposal: vi.fn(),
        });

        expect(await po.getPreviousButtonPo().isPresent()).toBe(true);
        expect(await po.getNextButtonPo().isPresent()).toBe(true);
      });

      it("should render test ids", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: [
            toNavigationId(2n),
            toNavigationId(1n),
            toNavigationId(0n),
          ],
          selectProposal: vi.fn(),
        });

        expect(await po.getPreviousButtonProposalId()).toEqual("2");
        expect(await po.getNextButtonProposalId()).toEqual("0");
      });

      it("should enable both buttons", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: [
            toNavigationId(2n),
            toNavigationId(1n),
            toNavigationId(0n),
          ],
          selectProposal: vi.fn(),
        });

        expect(await po.isNextButtonHidden()).toBe(false);
        expect(await po.isPreviousButtonHidden()).toBe(false);
      });

      it("should be visible even when the current proposal is not in the list", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(10n),
          currentProposalStatus: "open",
          proposalIds: [toNavigationId(20n), toNavigationId(0n)],
          selectProposal: vi.fn(),
        });

        expect(await po.isNextButtonHidden()).toBe(false);
        expect(await po.isPreviousButtonHidden()).toBe(false);
      });

      it("should hide to-previous-proposal button when the first proposal is selected", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: [toNavigationId(1n), toNavigationId(0n)],
          selectProposal: vi.fn(),
        });

        expect(await po.isNextButtonHidden()).toBe(false);
        expect(await po.isPreviousButtonHidden()).toBe(true);
      });

      it("should hide to-next-proposal when the last is selected", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: toNavigationId(1n),
          currentProposalStatus: "open",
          proposalIds: [toNavigationId(2n), toNavigationId(1n)],
          selectProposal: vi.fn(),
        });

        expect(await po.isNextButtonHidden()).toBe(true);
        expect(await po.isPreviousButtonHidden()).toBe(false);
      });
    });
  });

  it("should emmit to-next-proposal click", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: toNavigationId(2n),
      currentProposalStatus: "open",
      proposalIds: [
        toNavigationId(4n),
        toNavigationId(3n),
        toNavigationId(2n),
        toNavigationId(1n),
        toNavigationId(0n),
      ],
      selectProposal: selectProposalSpy,
    });

    await po.clickNext();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith(toNavigationId(1n));
  });

  it("should emmit to-previous-proposal click", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: toNavigationId(2n),
      currentProposalStatus: "open",
      proposalIds: [
        toNavigationId(4n),
        toNavigationId(3n),
        toNavigationId(2n),
        toNavigationId(1n),
        toNavigationId(0n),
      ],
      selectProposal: selectProposalSpy,
    });

    await po.clickPrevious();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith(toNavigationId(3n));
  });

  it("should emit with right arguments for non-consecutive ids", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: toNavigationId(13n),
      currentProposalStatus: "open",
      proposalIds: [
        toNavigationId(99n),
        toNavigationId(17n),
        toNavigationId(13n),
        toNavigationId(4n),
        toNavigationId(2n),
        toNavigationId(1n),
        toNavigationId(0n),
      ],
      selectProposal: selectProposalSpy,
    });

    await po.clickPrevious();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(17n));
    await po.clickNext();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(4n));
  });

  it("should emit with right arguments even when the current id is not in the list", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: toNavigationId(9n),
      currentProposalStatus: "open",
      proposalIds: [
        toNavigationId(99n),
        toNavigationId(17n),
        toNavigationId(13n),
        toNavigationId(4n),
        toNavigationId(2n),
        toNavigationId(1n),
        toNavigationId(0n),
      ],
      selectProposal: selectProposalSpy,
    });

    await po.clickPrevious();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(13n));
    await po.clickNext();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(4n));
  });

  it("should search between universes", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: { proposalId: 2000n, universe: "bbbbb-bbbbb" },
      currentProposalStatus: "open",
      proposalIds: [
        { proposalId: 40n, universe: "aaaaa-aaaaa" },
        { proposalId: 4n, universe: "aaaaa-aaaaa" },
        // Removed record -> { proposalId: 2000n, universe: "bbbbb-bbbbb" }
        { proposalId: 100n, universe: "ccccc-ccccc" },
        { proposalId: 1n, universe: "ccccc-ccccc" },
      ],
      universes: ["aaaaa-aaaaa", "bbbbb-bbbbb", "ccccc-ccccc"],
      selectProposal: selectProposalSpy,
    });

    await po.clickPrevious();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith({
      proposalId: 4n,
      universe: "aaaaa-aaaaa",
    });

    await po.clickNext();

    expect(selectProposalSpy).toHaveBeenCalledTimes(2);
    expect(selectProposalSpy).toHaveBeenCalledWith({
      proposalId: 100n,
      universe: "ccccc-ccccc",
    });
  });
});
