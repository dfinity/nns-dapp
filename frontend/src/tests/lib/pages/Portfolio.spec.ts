import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import Portfolio from "$lib/pages/Portfolio.svelte";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import type { UserToken } from "$lib/types/tokens-page";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Portfolio page", () => {
  const renderPage = (
    { userTokensData }: { userTokensData: UserToken[] } = { userTokensData: [] }
  ) => {
    const { container } = render(Portfolio, {
      props: {
        userTokensData: userTokensData,
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

    it("should show the NoNeuronsCard with secondary action", async () => {
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
        const po = renderPage({ userTokensData: [token1, token2] });

        expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe(
          "$12.00"
        );
        expect(await po.getUsdValueBannerPo().getSecondaryAmount()).toBe(
          "1.20 ICP"
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
    });
  });
});
