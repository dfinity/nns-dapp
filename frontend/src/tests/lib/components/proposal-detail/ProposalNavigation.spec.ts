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
          currentProposalId: 1n,
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
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.getProposalStatus()).toEqual("Open");
      });

      it("should render proposal title", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.getTitle()).toEqual("Title");
      });

      it("should hide buttons if no proposalIds", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: undefined,
          selectProposal: vi.fn(),
        });

        expect(await po.isOlderButtonHidden()).toBe(true);
        expect(await po.isNewerButtonHidden()).toBe(true);
      });
    });

    describe("display", () => {
      it("should render buttons", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: [
            toNavigationId(2n),
            toNavigationId(1n),
            toNavigationId(0n),
          ],
          selectProposal: vi.fn(),
        });

        expect(await po.getNewerButtonPo().isPresent()).toBe(true);
        expect(await po.getOlderButtonPo().isPresent()).toBe(true);
      });

      it("should render test ids", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: [
            toNavigationId(2n),
            toNavigationId(1n),
            toNavigationId(0n),
          ],
          selectProposal: vi.fn(),
        });

        expect(await po.getNewerButtonProposalId()).toEqual("2");
        expect(await po.getOlderButtonProposalId()).toEqual("0");
      });

      it("should enable both buttons", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: [
            toNavigationId(2n),
            toNavigationId(1n),
            toNavigationId(0n),
          ],
          selectProposal: vi.fn(),
        });

        expect(await po.isOlderButtonHidden()).toBe(false);
        expect(await po.isNewerButtonHidden()).toBe(false);
      });

      it("should be visible even when the current proposal is not in the list", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 10n,
          currentProposalStatus: "open",
          proposalIds: [toNavigationId(20n), toNavigationId(0n)],
          selectProposal: vi.fn(),
        });

        expect(await po.isOlderButtonHidden()).toBe(false);
        expect(await po.isNewerButtonHidden()).toBe(false);
      });

      it("should hide to-newer-proposal button when the newest proposal is selected", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: [toNavigationId(1n), toNavigationId(0n)],
          selectProposal: vi.fn(),
        });

        expect(await po.isOlderButtonHidden()).toBe(false);
        expect(await po.isNewerButtonHidden()).toBe(true);
      });

      it("should hide to-oldest-proposal when the oldest is selected", async () => {
        const po = renderComponent({
          title: "Title",
          currentProposalId: 1n,
          currentProposalStatus: "open",
          proposalIds: [toNavigationId(2n), toNavigationId(1n)],
          selectProposal: vi.fn(),
        });

        expect(await po.isOlderButtonHidden()).toBe(true);
        expect(await po.isNewerButtonHidden()).toBe(false);
      });
    });
  });

  it("should emmit to-older-proposal click", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: 2n,
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

    await po.clickOlder();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith(toNavigationId(1n));
  });

  it("should emmit to-newer-proposal click", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: 2n,
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

    await po.clickNewer();

    expect(selectProposalSpy).toHaveBeenCalledTimes(1);
    expect(selectProposalSpy).toHaveBeenCalledWith(toNavigationId(3n));
  });

  it("should emit with right arguments for non-consecutive ids", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: 13n,
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

    await po.clickNewer();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(17n));
    await po.clickOlder();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(4n));
  });

  it("should emit with right arguments even when the current id is not in the list", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: 9n,
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

    await po.clickNewer();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(13n));
    await po.clickOlder();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(4n));
  });

  it("should sort ids", async () => {
    const selectProposalSpy = vi.fn();
    const po = renderComponent({
      title: "Title",
      currentProposalId: 3n,
      currentProposalStatus: "open",
      proposalIds: [
        toNavigationId(0n),
        toNavigationId(1n),
        toNavigationId(5n),
        toNavigationId(3n),
        toNavigationId(7n),
        toNavigationId(9n),
        toNavigationId(2n),
      ],
      selectProposal: selectProposalSpy,
    });

    await po.clickNewer();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(5n));
    await po.clickOlder();
    expect(selectProposalSpy).toHaveBeenLastCalledWith(toNavigationId(2n));
  });
});
