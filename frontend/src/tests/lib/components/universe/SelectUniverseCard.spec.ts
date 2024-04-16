import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
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
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { mockSummary } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { SelectUniverseCardPo } from "$tests/page-objects/SelectUniverseCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
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
    vi.restoreAllMocks();
    overrideFeatureFlagsStore.reset();
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

  describe("theme", () => {
    it("display theme framed if role button", async () => {
      const po = await renderComponent({
        props: { ...props, role: "button" },
      });
      expect(await po.isFramed()).toBe(true);
    });

    it("display theme transparent if role link", async () => {
      const po = await renderComponent({
        props: { ...props, role: "link" },
      });
      expect(await po.isTransparent()).toBe(true);
    });

    it("display no theme if role dropdown", async () => {
      const po = await renderComponent({
        props: { ...props, role: "dropdown" },
      });
      expect(await po.isFramed()).toBe(false);
      expect(await po.isTransparent()).toBe(false);
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
        actionableSnsProposalsStore.resetForTesting();
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
            includeBallotsByCaller: true,
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
          ).toBe("There are 2 Tetris proposals you can vote on.");
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
          ).toBe("There are 2 NNS proposals you can vote on.");
        });

        it("should not display actionable proposal count when the feature flag is disabled", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Proposals,
          });

          actionableSnsProposalsStore.set({
            rootCanisterId: Principal.from(mockSnsUniverse.canisterId),
            proposals: [mockSnsProposal, mockSnsProposal],
            includeBallotsByCaller: true,
          });

          const po = await renderComponent({
            props: { universe: mockSnsUniverse, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            true
          );

          overrideFeatureFlagsStore.setFlag("ENABLE_VOTING_INDICATION", false);

          await runResolvedPromises();

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            false
          );
        });

        it("should not display actionable proposal count when not on neurons page", async () => {
          page.mock({
            data: { universe: OWN_CANISTER_ID_TEXT },
            routeId: AppPath.Neurons,
          });

          actionableSnsProposalsStore.set({
            rootCanisterId: Principal.from(mockSnsUniverse.canisterId),
            proposals: [mockSnsProposal, mockSnsProposal],
            includeBallotsByCaller: true,
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
            includeBallotsByCaller: true,
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

        it("should display not supported indicator", async () => {
          page.mock({
            data: { universe: mockSnsUniverse.canisterId },
            routeId: AppPath.Proposals,
          });
          actionableSnsProposalsStore.set({
            rootCanisterId: Principal.from(mockSnsUniverse.canisterId),
            proposals: [mockSnsProposal, mockSnsProposal],
            includeBallotsByCaller: undefined,
          });

          const po = await renderComponent({
            props: { universe: mockSnsUniverse, selected: false },
          });

          expect(await po.getActionableProposalCountBadgePo().isPresent()).toBe(
            false
          );
          expect(
            await po.getActionableProposalNotSupportedBadge().isPresent()
          ).toBe(true);
          expect(
            await po
              .getActionableProposalNotSupportedTooltipPo()
              .getTooltipText()
          ).toBe("This SNS doesn't yet support actionable proposals.");
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
});
