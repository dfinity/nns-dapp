import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import type { Universe } from "$lib/types/universe";
import { createUniverse } from "$lib/utils/universe.utils";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { mockSummary, principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { SelectUniverseCardPo } from "$tests/page-objects/SelectUniverseCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";
import { describe } from "vitest";

describe("SelectUniverseCard", () => {
  const props = { universe: nnsUniverseMock, selected: false };
  const mockSnsUniverse: Universe = createUniverse(mockSummary);

  const renderComponent = async (props) => {
    const { container } = render(SelectUniverseCard, props);
    await runResolvedPromises();
    return SelectUniverseCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetAccountsForTesting();
    resetIdentity();
  });

  describe("selected", () => {
    it("display a selected card", async () => {
      const po = await renderComponent({
        props: { ...props, selected: true },
      });
      expect(await po.isSelected()).toBe(true);
    });

    it("display a not selected card", async () => {
      const po = await renderComponent({
        props,
      });
      expect(await po.isSelected()).toBe(false);
    });
  });

  describe("icon", () => {
    it("display no icon if role button but not selected", async () => {
      const po = await renderComponent({
        props: { ...props, role: "button", selected: false },
      });
      expect(await po.hasIcon()).toBe(false);
    });

    it("display an icon if role dropdown", async () => {
      const po = await renderComponent({
        props: { ...props, role: "dropdown" },
      });
      expect(await po.hasIcon()).toBe(true);
    });
  });

  describe("nns", () => {
    it("should display ic logo", async () => {
      const po = await renderComponent({
        props,
      });
      expect(await po.getUniverseLogoPo().isPresent()).toBe(true);
      expect(await po.getLogoAltText()).toBe(en.auth.ic_logo);
    });

    it("should display internet computer", async () => {
      const po = await renderComponent({
        props,
      });
      expect(await po.getName()).toBe(en.core.ic);
    });

    it("should use a big framed logo", async () => {
      const po = await renderComponent({
        props,
      });
      const logo = po.getUniverseLogoPo().getLogoPo();
      expect(await logo.isPresent()).toBe(true);
      expect(await logo.getSize()).toBe("medium");
      expect(await logo.isFramed()).toBe(true);
      expect(await po.getUniverseLogoPo().getVoteLogoPo().isPresent()).toBe(
        false
      );
    });
  });

  describe("sns", () => {
    it("should display logo", async () => {
      const po = await renderComponent({
        props: { universe: mockSnsUniverse, selected: false },
      });
      expect(await po.getUniverseLogoPo().isPresent()).toBe(true);
      expect(await po.getLogoSource()).toBe(mockSummary.metadata.logo);
    });

    it("should display name", async () => {
      const po = await renderComponent({
        props: { universe: mockSnsUniverse, selected: false },
      });
      expect(await po.getName()).toBe(mockSummary.metadata.name);
    });

    it("should use a big framed logo", async () => {
      const po = await renderComponent({
        props,
      });
      const logo = po.getUniverseLogoPo().getLogoPo();
      expect(await logo.isPresent()).toBe(true);
      expect(await logo.getSize()).toBe("medium");
      expect(await logo.isFramed()).toBe(true);
      expect(await po.getUniverseLogoPo().getVoteLogoPo().isPresent()).toBe(
        false
      );
    });
  });

  describe("project-balance", () => {
    beforeEach(() => {
      setAccountsForTesting({
        main: {
          ...mockMainAccount,
          balanceUlps: 100_000_000n,
        },
        subAccounts: [
          {
            ...mockSubAccount,
            balanceUlps: 200_000_000n,
          },
        ],
        hardwareWallets: [
          {
            ...mockHardwareWalletAccount,
            balanceUlps: 400_000_000n,
          },
        ],
        certified: true,
      });
    });

    describe("when signed in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should display balance if selected", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Accounts,
        });

        const po = await renderComponent({
          props: { universe: nnsUniverseMock, selected: true },
        });
        // Expecting 1 + 2 + 4.
        expect(await po.getBalance()).toBe("7.00");
      });

      it("should display balance if not selected", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Accounts,
        });

        const po = await renderComponent({
          props: { universe: nnsUniverseMock, selected: false },
        });
        // Expecting 1 + 2 + 4.
        expect(await po.getBalance()).toBe("7.00");
      });

      it("should not display balance on other path than accounts", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Neurons,
        });

        const po = await renderComponent({
          props: { universe: mockSnsUniverse, selected: true },
        });
        expect(await po.hasBalance()).toBe(false);
      });

      it("should not display balance if summary balance not loaded", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Accounts,
        });

        // Mock contains only Nns balance
        const po = await renderComponent({
          props: { universe: mockSnsUniverse, selected: false },
        });
        expect(await po.getUniverseAccountsBalancePo().isPresent()).toBe(true);
        expect(await po.getUniverseAccountsBalancePo().isLoaded()).toBe(false);
      });

      describe("actionable proposals", () => {
        it("should display actionable proposal count", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Proposals,
          });

          actionableSnsProposalsStore.set({
            rootCanisterId: Principal.from(mockSnsUniverse.canisterId),
            proposals: [mockSnsProposal, mockSnsProposal],
          });

          const po = await renderComponent({
            props: { universe: mockSnsUniverse, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            true
          );
          expect((await po.getActionableProposalCount()).trim()).toBe("2");
          expect(
            await po
              .getActionableProposalCountBadgePo()
              .getTooltipPo()
              .getTooltipText()
          ).toBe("You can still vote on 2 Tetris proposals.");
        });

        it("should display actionable proposal count tooltip for NNS", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Proposals,
          });

          actionableNnsProposalsStore.setProposals([...mockProposals]);

          const po = await renderComponent({
            props: { universe: nnsUniverseMock, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            true
          );
          expect((await po.getActionableProposalCount()).trim()).toBe("2");
          expect(
            await po
              .getActionableProposalCountBadgePo()
              .getTooltipPo()
              .getTooltipText()
          ).toBe("You can still vote on 2 NNS proposals.");
        });

        it("should not display actionable proposal count when not on neurons page", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Neurons,
          });

          actionableSnsProposalsStore.set({
            rootCanisterId: Principal.from(mockSnsUniverse.canisterId),
            proposals: [mockSnsProposal, mockSnsProposal],
          });

          const po = await renderComponent({
            props: { universe: mockSnsUniverse, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            false
          );
        });

        it("should not display actionable proposal count when it's 0", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Proposals,
          });

          actionableSnsProposalsStore.set({
            rootCanisterId: Principal.from(mockSnsUniverse.canisterId),
            proposals: [],
          });

          const po = await renderComponent({
            props: { universe: mockSnsUniverse, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            false
          );
        });

        it("should not display actionable proposal count when no data", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Proposals,
          });

          const po = await renderComponent({
            props: { universe: mockSnsUniverse, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            false
          );
          expect(
            await po.getActionableProposalNotSupportedBadge().isPresent()
          ).toBe(false);
        });
      });
    });

    describe("when not signed in", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should display balance if selected", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Accounts,
        });

        const po = await renderComponent({
          props: { universe: nnsUniverseMock, selected: true },
        });
        expect(await po.hasBalance()).toBe(false);
      });

      it("should display balance if not selected", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Accounts,
        });

        const po = await renderComponent({
          props: { universe: nnsUniverseMock, selected: false },
        });
        expect(await po.hasBalance()).toBe(false);
      });
    });
  });

  describe("all-actionable proposals mode", () => {
    it("should display custom icon and text", async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });

      const po = await renderComponent({
        props: { universe: "all-actionable", selected: false },
      });

      expect(await po.hasVoteIcon()).toBe(true);
      expect(await po.getName()).toBe("Actionable Proposals");
    });

    it("should use a big framed vote logo", async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });

      const po = await renderComponent({
        props: { universe: "all-actionable", selected: false },
      });

      const logo = po.getUniverseLogoPo().getVoteLogoPo();
      expect(await logo.isPresent()).toBe(true);
      expect(await logo.getSize()).toBe("medium");
      expect(await logo.isFramed()).toBe(true);
      expect(await po.getUniverseLogoPo().getLogoPo().isPresent()).toBe(false);
    });

    it('should not display custom icon and text when not "all-actionable"', async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });

      const po = await renderComponent({
        props: { universe: nnsUniverseMock, selected: false },
      });
      expect(await po.getName()).toBe("Internet Computer");
      expect(await po.hasVoteIcon()).toBe(false);
    });

    it("should display total actionable count", async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });
      const nnsProposals: ProposalInfo[] = [
        {
          ...mockProposalInfo,
          id: 0n,
        },
        {
          ...mockProposalInfo,
          id: 1n,
        },
      ];
      const snsProposals = [mockSnsProposal];
      const principal0 = principal(0);
      const principal1 = principal(1);
      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: snsProposals,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: snsProposals,
      });

      await runResolvedPromises();

      const po = await renderComponent({
        props: { universe: "all-actionable", selected: false },
      });
      expect((await po.getActionableProposalCount()).trim()).toBe("4");
    });
  });
});
