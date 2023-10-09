import Summary from "$lib/components/summary/Summary.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { page } from "$mocks/$app/stores";
import en from "$tests/mocks/i18n.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("Summary", () => {
  const rootCanisterId = rootCanisterIdMock;

  beforeEach(() => {
    vi.clearAllMocks();
    page.reset();
    resetSnsProjects();
  });

  it("should render a logo", () => {
    const { getByTestId } = render(Summary);
    expect(getByTestId("project-logo")).not.toBeNull();
  });

  describe("no universe", () => {
    it("should render internet computer if none", () => {
      const { container } = render(Summary, {
        props: { displayUniverse: false },
      });

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.core.ic)
      ).toBeTruthy();
    });
  });

  describe("nns", () => {
    it("should render internet computer", () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID.toText() },
      });

      const { container } = render(Summary);

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.core.ic)
      ).toBeTruthy();
    });
  });

  describe("sns", () => {
    it("should render project", () => {
      page.mock({
        data: { universe: rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
      const projectName = "test";
      setSnsProjects([
        {
          projectName,
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId,
        },
      ]);

      const { container } = render(Summary);

      expect(
        container?.querySelector("h1")?.textContent?.includes(projectName)
      ).toBeTruthy();
    });
  });

  describe("ckBTC", () => {
    it("should render ckBTC", () => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });

      const { container } = render(Summary);

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.ckbtc.title)
      ).toBeTruthy();
    });
  });
});
