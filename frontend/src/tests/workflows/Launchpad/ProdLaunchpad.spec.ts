import * as agent from "$lib/api/agent.api";
import * as proposalsApi from "$lib/api/proposals.api";
import { authStore } from "$lib/stores/auth.store";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import Launchpad from "$tests/workflows/Launchpad/LaunchpadWithLayout.svelte";
import type { HttpAgent } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { isNullish } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/proposals.api");

describe("Launchpad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.setForTesting(null);

    vi.spyOn(proposalsApi, "queryProposals").mockImplementation(() =>
      Promise.resolve([])
    );

    // TODO: agent mocked because some calls to global.fetch were exposed when we migrated to agent-js v0.20.2
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    // Depends on the `snsAggregatorUrl` set in `vi-setup.ts`.
    const aggUrlRegex =
      /https:\/\/5v72r-4aaaa-aaaaa-aabnq-cai\.small12\.testnet\.dfinity\.network\/v1\/sns\/list\/page\/(.)\/slow\.json/;

    const mockFetch = vi.fn();
    mockFetch.mockImplementation(async (url: string) => {
      const [_, page] = url.match(aggUrlRegex);
      try {
        const moduleData = await import(`./sns-agg-page-${page}.json`);
        const response = moduleData.default;
        if (isNullish(response)) {
          throw new Error(`No mock for page ${page}`);
        }
        return {
          ok: true,
          json: () => Promise.resolve(response),
        };
      } catch (err) {
        // The frontend shuold stop requesting pages when the aggregator returns a page with less than 10 projects.
        return {
          ok: false,
          json: () => Promise.reject(err),
        };
      }
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
