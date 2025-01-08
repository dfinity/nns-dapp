import Portfolio from "$lib/pages/Portfolio.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Portfolio page", () => {
  const renderPage = () => {
    const { container } = render(Portfolio);

    return PortfolioPagePo.under(new JestPageObjectElement(container));
  };

  describe("when not logged in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should display the login card when the user is not logged in", async () => {
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
    });

    it("should not display the login card when the user is logged in", async () => {
      const page = renderPage();
      expect(await page.getLoginCard().isPresent()).toBe(false);
    });
  });
});
