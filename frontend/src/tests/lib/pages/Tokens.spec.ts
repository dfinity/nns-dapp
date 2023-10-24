import TokensPage from "$lib/pages/Tokens.svelte";
import type { UserTokenData } from "$lib/types/tokens-page";
import { userTokensPageMock } from "$tests/mocks/tokens-page.mock";
import { TokensPagePo } from "$tests/page-objects/TokensPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Tokens page", () => {
  const renderPage = (tokens: UserTokenData[]) => {
    const { container } = render(TokensPage, {
      props: { tokens },
    });
    return TokensPagePo.under(new JestPageObjectElement(container));
  };

  it("should render the tokens table", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.hasTokensTable()).toBeDefined();
  });

  it("should render a row per token", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.getTokensTable().getRows()).toHaveLength(
      userTokensPageMock.length
    );
  });
});
