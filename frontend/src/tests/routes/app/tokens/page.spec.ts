import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import TokensRoute from "$routes/(app)/(nns)/tokens/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { TokensRoutePo } from "$tests/page-objects/TokensRoute.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Tokens route", () => {
  const renderPage = async () => {
    const { container } = render(TokensRoute);

    await runResolvedPromises();

    return TokensRoutePo.under(new JestPageObjectElement(container));
  };

  describe("when feature flag enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      setSnsProjects([
        {
          rootCanisterId: rootCanisterIdMock,
          projectName: "Tetris",
          lifecycle: SnsSwapLifecycle.Committed,
        },
        {
          rootCanisterId: principal(1),
          projectName: "Pacman",
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
    });

    describe("when logged in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should render my tokens page", async () => {
        const po = await renderPage();

        expect(await po.hasLoginPage()).toBe(false);
        expect(await po.hasTokensPage()).toBe(true);
      });
    });

    describe("when logged out", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should render sign-in if not logged in", async () => {
        const po = await renderPage();

        expect(await po.hasLoginPage()).toBe(true);
        expect(await po.hasTokensPage()).toBe(false);
      });

      it("should render ICP and SNS tokens", async () => {
        const po = await renderPage();

        const signInPo = po.getSignInTokensPagePo();
        expect(await signInPo.getTokenNames()).toEqual([
          "Internet Computer",
          "Tetris",
          "Pacman",
        ]);
      });
    });
  });

  describe("when feature flag disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
      page.mock({ routeId: AppPath.Tokens });
    });

    it("should redirect to accounts page", async () => {
      expect(get(pageStore).path).toEqual(AppPath.Tokens);

      await renderPage();

      expect(get(pageStore).path).toEqual(AppPath.Accounts);
    });
  });
});
