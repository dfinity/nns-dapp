import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import Portfolio from "$lib/pages/Portfolio.svelte";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import type { TableProject } from "$lib/types/staking";
import type { UserToken } from "$lib/types/tokens-page";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Portfolio page", () => {
  const renderPage = ({
    userTokensData = [],
    tableProjects = [],
  }: { userTokensData?: UserToken[]; tableProjects?: TableProject[] } = {}) => {
    const { container } = render(Portfolio, {
      props: {
        userTokensData,
        tableProjects,
      },
    });

    return PortfolioPagePo.under(new JestPageObjectElement(container));
  };

  describe("when not logged in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should display the LoginCard when the user is not logged in", async () => {
      const po = renderPage();

      expect(await po.getLoginCard().isPresent()).toBe(true);
    });

    it("should show the NoTokensCard", async () => {
      const po = renderPage();

      expect(await po.getNoTokensCard().isPresent()).toBe(true);
    });

    it("should show the NoProjectsCardPo with secondary action", async () => {
      const po = renderPage();

      expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
      expect(await po.getNoNeuronsCarPo().hasSecondaryAction()).toBe(true);
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      resetIdentity();

      icpSwapTickersStore.set([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: "10.00",
        },
      ]);
    });

    it("should not display the LoginCard when the user is logged in", async () => {
      const po = renderPage();

      expect(await po.getLoginCard().isPresent()).toBe(false);
    });

    describe("NoTokensCard", () => {
      it("should display the card when the tokens accounts balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoTokensCard().isPresent()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });

      it("should not display the card when the tokens accounts balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokensData: [token] });

        expect(await po.getNoTokensCard().isPresent()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });
    });

    describe("NoProjectsCard", () => {
      it("should display the card when the total balance is zero", async () => {
        const po = renderPage();

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });

      it("should not display the card when the neurons accounts balance is not zero", async () => {
        const tableProject: TableProject = {
          ...mockTableProject,
          stakeInUsd: 2,
        };
        const po = renderPage({ tableProjects: [tableProject] });

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });

      it("should display a primary action when the neurons accounts balance is zero and the tokens balance is not zero", async () => {
        const token = createUserToken({
          universeId: principal(1),
          balanceInUsd: 2,
        });
        const po = renderPage({ userTokensData: [token] });

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
        expect(await po.getNoNeuronsCarPo().hasPrimaryAction()).toBe(true);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$2.00");
      });

      it("should not display a primary action when the neurons accounts balance is zero and the tokens balance is also zero", async () => {
        const po = renderPage();

        expect(await po.getNoNeuronsCarPo().isPresent()).toBe(true);
        expect(await po.getNoNeuronsCarPo().hasPrimaryAction()).toBe(false);
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$0.00");
      });
    });

    describe("UsdValueBanner", () => {
      it("should display total assets", async () => {
        const token1 = createUserToken({
          universeId: principal(1),
          balanceInUsd: 5,
        });
        const token2 = createUserToken({
          universeId: principal(1),
          balanceInUsd: 7,
        });

        const tableProject1: TableProject = {
          ...mockTableProject,
          stakeInUsd: 2,
        };
        const tableProject2: TableProject = {
          ...mockTableProject,
          stakeInUsd: 10.5,
        };
        const po = renderPage({
          userTokensData: [token1, token2],
          tableProjects: [tableProject1, tableProject2],
        });

        // There are two tokens with a balance of 5$ and 7$, and two projects with a staked balance of 2$ and 10.5$ -> 24.5$
        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$24.50"
        );
        // 1ICP == 10$
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "2.45 ICP"
        );
        expect(
          await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(false);
      });

      it("should ignore tokens with unknown balance in USD and display tooltip", async () => {
        const token1 = createUserToken({
          universeId: principal(1),
          balanceInUsd: 5,
        });
        const token2 = createUserToken({
          universeId: principal(1),
          balanceInUsd: 7,
        });
        const token3 = createUserToken({
          universeId: principal(1),
          balanceInUsd: undefined,
        });
        const po = renderPage({ userTokensData: [token1, token2, token3] });

        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$12.00"
        );
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "1.20 ICP"
        );
        expect(
          await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(true);
      });

      it("should ignore neurons with unknown balance in USD and display tooltip", async () => {
        const tableProject1: TableProject = {
          ...mockTableProject,
          stakeInUsd: 2,
        };
        const tableProject2: TableProject = {
          ...mockTableProject,
          stakeInUsd: 10.5,
        };
        const tableProject3: TableProject = {
          ...mockTableProject,
          stakeInUsd: undefined,
        };
        const po = renderPage({
          tableProjects: [tableProject1, tableProject2, tableProject3],
        });

        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$12.50"
        );
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "1.25 ICP"
        );
        expect(
          await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
        ).toBe(true);
      });
    });
  });
});
