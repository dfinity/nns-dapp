import MyTokensRoute from "$routes/(app)/(nns)/my-tokens/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { MyTokensRoutePo } from "$tests/page-objects/MyTokensRoute.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("MyTokens route", () => {
  const renderPage = () => {
    const { container } = render(MyTokensRoute);

    return MyTokensRoutePo.under(new JestPageObjectElement(container));
  };

  describe("when logged in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render my tokens page", async () => {
      const po = renderPage();

      expect(await po.hasLoginPage()).toBe(false);
      expect(await po.hasMyTokensPage()).toBe(true);
    });
  });

  describe("when logged out", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should render sign-in if not logged in", async () => {
      const po = renderPage();

      expect(await po.hasLoginPage()).toBe(true);
      expect(await po.hasMyTokensPage()).toBe(false);
    });
  });
});
