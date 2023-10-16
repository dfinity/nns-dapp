import * as proposalsApi from "$lib/api/proposals.api";
import { authStore } from "$lib/stores/auth.store";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import Launchpad from "$tests/workflows/Launchpad/LaunchpadWithLayout.svelte";
import { toastsStore } from "@dfinity/gix-components";
import { isNullish } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import snsPage0 from "./sns-agg-page-0-2023-09-29-1545.json";
import snsPage1 from "./sns-agg-page-1-2023-09-29-1545.json";

vi.mock("$lib/api/proposals.api");

describe("Launchpad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.setForTesting(null);

    vi.spyOn(proposalsApi, "queryProposals").mockImplementation(() =>
      Promise.resolve([])
    );

    // Depends on the `snsAggregatorUrl` set in `vi-setup.ts`.
    const aggUrlRegex =
      /https:\/\/5v72r-4aaaa-aaaaa-aabnq-cai\.small12\.testnet\.dfinity\.network\/v1\/sns\/list\/page\/(.)\/slow\.json/;
    const pagesMockMapper = {
      0: snsPage0,
      1: snsPage1,
    };

    const mockFetch = vi.fn();
    mockFetch.mockImplementation(async (url: string) => {
      const [_, page] = url.match(aggUrlRegex);
      const mock = pagesMockMapper[page];
      if (isNullish(mock)) {
        throw new Error(`No mock for page ${page}`);
      }
      return {
        ok: true,
        json: () => Promise.resolve(mock),
      };
    });
    global.fetch = mockFetch;
  });

  it("loads with prod data", async () => {
    const { container } = render(Launchpad);

    const po = LaunchpadPo.under(new JestPageObjectElement(container));

    await po.getCommittedProjectsPo().waitForContentLoaded();

    await waitFor(async () =>
      expect(
        (await po.getCommittedProjectsPo().getProjectCardPos()).length
      ).toBeGreaterThan(0)
    );

    expect(get(toastsStore).length).toBe(0);
  });
});
