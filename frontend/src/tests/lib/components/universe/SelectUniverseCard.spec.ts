import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
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
import { mockSummary } from "$tests/mocks/sns-projects.mock";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { SelectUniverseCardPo } from "$tests/page-objects/SelectUniverseCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("SelectUniverseCard", () => {
  const props = { universe: nnsUniverseMock, selected: false };
  const mockSnsUniverse: Universe = createUniverse(mockSummary);

  const renderComponent = (props) => {
    const { container } = render(SelectUniverseCard, props);
    return SelectUniverseCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    icpAccountsStore.resetForTesting();
    resetIdentity();
  });

  describe("selected", () => {
    it("display a selected card", async () => {
      const po = renderComponent({
        props: { ...props, selected: true },
      });
      expect(await po.isSelected()).toBe(true);
    });

    it("display a not selected card", async () => {
      const po = renderComponent({
        props,
      });
      expect(await po.isSelected()).toBe(false);
    });
  });

  describe("theme", () => {
    it("display theme framed if role button", async () => {
      const po = renderComponent({
        props: { ...props, role: "button" },
      });
      expect(await po.isFramed()).toBe(true);
    });

    it("display theme transparent if role link", async () => {
      const po = renderComponent({
        props: { ...props, role: "link" },
      });
      expect(await po.isTransparent()).toBe(true);
    });

    it("display no theme if role dropdown", async () => {
      const po = renderComponent({
        props: { ...props, role: "dropdown" },
      });
      expect(await po.isFramed()).toBe(false);
      expect(await po.isTransparent()).toBe(false);
    });
  });

  describe("icon", () => {
    it("display an icon if role button and selected", async () => {
      const po = renderComponent({
        props: { ...props, role: "button", selected: true },
      });
      expect(await po.hasIcon()).toBe(true);
    });

    it("display no icon if role button but not selected", async () => {
      const po = renderComponent({
        props: { ...props, role: "button", selected: false },
      });
      expect(await po.hasIcon()).toBe(false);
    });

    it("display an icon if role dropdown", async () => {
      const po = renderComponent({
        props: { ...props, role: "dropdown" },
      });
      expect(await po.hasIcon()).toBe(true);
    });
  });

  describe("nns", () => {
    it("should display ic logo", async () => {
      const po = renderComponent({
        props,
      });
      expect(await po.getUniverseLogoPo().isPresent()).toBe(true);
      expect(await po.getLogoAltText()).toBe(en.auth.ic_logo);
    });

    it("should display internet computer", async () => {
      const po = renderComponent({
        props,
      });
      expect(await po.getName()).toBe(en.core.ic);
    });
  });

  describe("sns", () => {
    it("should display logo", async () => {
      const po = renderComponent({
        props: { universe: mockSnsUniverse, selected: false },
      });
      expect(await po.getUniverseLogoPo().isPresent()).toBe(true);
      expect(await po.getLogoSource()).toBe(mockSummary.metadata.logo);
    });

    it("should display name", async () => {
      const po = renderComponent({
        props: { universe: mockSnsUniverse, selected: false },
      });
      expect(await po.getName()).toBe(mockSummary.metadata.name);
    });
  });

  describe("project-balance", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting({
        main: {
          ...mockMainAccount,
          balanceE8s: 100_000_000n,
        },
        subAccounts: [
          {
            ...mockSubAccount,
            balanceE8s: 200_000_000n,
          },
        ],
        hardwareWallets: [
          {
            ...mockHardwareWalletAccount,
            balanceE8s: 400_000_000n,
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

        const po = renderComponent({
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

        const po = renderComponent({
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

        const po = renderComponent({
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
        const po = renderComponent({
          props: { universe: mockSnsUniverse, selected: false },
        });
        expect(await po.getUniverseAccountsBalancePo().isPresent()).toBe(true);
        expect(await po.getUniverseAccountsBalancePo().isLoaded()).toBe(false);
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

        const po = renderComponent({
          props: { universe: nnsUniverseMock, selected: true },
        });
        expect(await po.hasBalance()).toBe(false);
      });

      it("should display balance if not selected", async () => {
        page.mock({
          data: { universe: OWN_CANISTER_ID_TEXT },
          routeId: AppPath.Accounts,
        });

        const po = renderComponent({
          props: { universe: nnsUniverseMock, selected: false },
        });
        expect(await po.hasBalance()).toBe(false);
      });
    });
  });
});
