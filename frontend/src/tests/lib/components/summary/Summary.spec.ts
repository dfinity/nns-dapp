import Summary from "$lib/components/summary/Summary.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { page } from "$mocks/$app/stores";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { UniverseSummaryPo } from "$tests/page-objects/UniverseSummary.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("Summary", () => {
  const renderComponent = () => {
    const { container } = render(Summary);
    return UniverseSummaryPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    page.reset();
    resetSnsProjects();
  });

  describe("no universe", () => {
    it("should render internet computer if none", async () => {
      const po = renderComponent();
      expect(await po.getTitle()).toEqual("Internet Computer");
      expect(await po.getLogoUrl()).toEqual(nnsUniverseMock.logo);
      expect(await po.getLogoAlt()).toEqual("Internet Computer logo");
    });
  });

  describe("nns", () => {
    it("should render internet computer", async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID.toText() },
      });
      const po = renderComponent();
      expect(await po.getTitle()).toEqual("Internet Computer");
      expect(await po.getLogoUrl()).toEqual(nnsUniverseMock.logo);
      expect(await po.getLogoAlt()).toEqual("Internet Computer logo");
    });
  });

  describe("sns", () => {
    it("should render project", async () => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
      setSnsProjects([
        {
          projectName: "Tetriz",
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);

      const po = renderComponent();
      expect(await po.getTitle()).toEqual("Tetriz");
      expect(await po.getLogoAlt()).toEqual("Tetriz project logo");
    });
  });

  describe("ckBTC", async () => {
    it("should render ckBTC", async () => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });

      const po = renderComponent();
      expect(await po.getTitle()).toEqual("ckBTC");
    });
  });
});
