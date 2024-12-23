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

  beforeEach(() => {
    resetIdentity();
  });

  it("should display the login card when the user is not logged in", async () => {
    setNoIdentity();
    const po = renderPage();
    expect(await po.getLoginCard().isPresent()).toBe(true);
  });

  it("should not display the login card when the user is logged in", async () => {
    const page = renderPage();
    expect(await page.getLoginCard().isPresent()).toBe(false);
  });
});
