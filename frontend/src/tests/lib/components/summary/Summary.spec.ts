import Summary from "$lib/components/summary/Summary.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { page } from "$mocks/$app/stores";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";

describe("Summary", () => {
  it("should render a logo", () => {
    const { getByTestId } = render(Summary);
    expect(getByTestId("project-logo")).not.toBeNull();
  });

  describe("no universe", () => {
    beforeAll(() => {
      vi.spyOn(snsProjectSelectedStore, "subscribe").mockImplementation(
        mockStoreSubscribe(mockSnsFullProject)
      );

      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([mockSnsFullProject])
      );
    });

    it("should render internet computer if none", () => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
      });

      const { container } = render(Summary, {
        props: { displayUniverse: false },
      });

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.core.ic)
      ).toBeTruthy();
    });
  });

  describe("nns", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    beforeAll(() =>
      vi
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(undefined))
    );

    afterAll(() => vi.clearAllMocks());

    it("should render internet computer", () => {
      const { container } = render(Summary);

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.core.ic)
      ).toBeTruthy();
    });
  });

  describe("sns", () => {
    beforeAll(() => {
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([mockSnsFullProject])
      );

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
    });

    afterAll(() => vi.clearAllMocks());

    it("should render project", () => {
      const { container } = render(Summary);
      expect(
        container
          ?.querySelector("h1")
          ?.textContent?.includes(mockSnsFullProject.summary.metadata.name)
      ).toBeTruthy();
    });
  });

  describe("ckBTC", () => {
    beforeAll(() => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });
    });

    afterAll(() => vi.clearAllMocks());

    it("should render ckBTC", () => {
      const { container } = render(Summary);

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.ckbtc.title)
      ).toBeTruthy();
    });
  });
});
