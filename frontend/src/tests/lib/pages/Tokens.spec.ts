import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import TokensPage from "$lib/pages/Tokens.svelte";
import type { UserTokenData } from "$lib/types/tokens-page";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createUserToken,
  userTokensPageMock,
} from "$tests/mocks/tokens-page.mock";
import { TokensPagePo } from "$tests/page-objects/TokensPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

// TODO: Use constant from gix-components
const BREAKPOINT_MEDIUM = 768;

describe("Tokens page", () => {
  const renderPage = (userTokensData: UserTokenData[]) => {
    const { container } = render(TokensPage, {
      props: { userTokensData },
    });
    return TokensPagePo.under(new JestPageObjectElement(container));
  };

  // TODO: Move within a describe block
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).innerWidth = BREAKPOINT_MEDIUM + 10;
  });

  it("should render the tokens table", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.hasDesktopTokensTable()).toBeDefined();
  });

  it("should render a row per token", async () => {
    const token1 = createUserToken({
      universeId: OWN_CANISTER_ID,
    });
    const token2 = createUserToken({
      universeId: principal(0),
    });
    const po = renderPage([token1, token2]);
    expect(await po.getDesktopTokensTable().getRows()).toHaveLength(2);
  });

  describe("Mobile device", () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).innerWidth = BREAKPOINT_MEDIUM - 10;
    });

    it("should render the mobile tokens list", () => {
      const po = renderPage(userTokensPageMock);
      expect(po.hasMobileTokensList()).toBe(true);
    });
  });
});
