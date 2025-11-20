import * as agent from "$lib/api/agent.api";
import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as kongSwapApi from "$lib/api/kong-swap.api";
import * as proposalsApi from "$lib/api/proposals.api";
import { queryFinalizationStatus } from "$lib/api/sns-sale.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { authStore } from "$lib/stores/auth.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockKongSwapTicker } from "$tests/mocks/kong-swap.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Launchpad2Po } from "$tests/page-objects/Launchpad2.page-object";
import { setProdSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import Launchpad from "$tests/workflows/Launchpad/LaunchpadWithLayout.svelte";
import { toastsStore } from "@dfinity/gix-components";
import { isNullish } from "@dfinity/utils";
import type { HttpAgent } from "@icp-sdk/core/agent";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/proposals.api");
vi.mock("$lib/api/sns-sale.api");
vi.mock("$lib/api/icp-swap.api");
vi.mock("$lib/api/kong-swap.api");

vi.mock("$app/navigation", () => ({
  afterNavigate: vi.fn((callback) => {
    callback({ from: null, to: { url: new URL("http://localhost/") } });
  }),
}));

describe("Launchpad", () => {
  beforeEach(async () => {
    vi.stubGlobal("window", window);

    authStore.setForTesting(null);

    // Load production SNS projects from JSON files
    await setProdSnsProjects();

    vi.spyOn(proposalsApi, "queryProposals").mockImplementation(() =>
      Promise.resolve([])
    );

    vi.mocked(queryFinalizationStatus).mockResolvedValue({
      auto_finalize_swap_response: [],
      has_auto_finalize_been_attempted: [],
      is_auto_finalize_enabled: [],
    });

    // TODO: agent mocked because some calls to global.fetch were exposed when we migrated to agent-js v0.20.2
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockToken);

    // Mock ICP Swap tickers with ckUSDC ticker required by the provider
    const icpSwapTickers = [
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        base_currency: "ckUSDC",
        target_id: LEDGER_CANISTER_ID.toText(),
        target_currency: "ICP",
        last_price: "10.00", // 1 ICP = 10 ckUSDC
        volume_usd_24H: "1000",
      },
    ];
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(
      icpSwapTickers
    );

    // Mock Kong Swap tickers with ckUSDC ticker required by the provider
    const kongSwapTickers = [
      {
        ...mockKongSwapTicker,
        base_currency: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        target_currency: LEDGER_CANISTER_ID.toText(),
        last_price: 0.1, // 1 ICP = 10 ckUSDC
        liquidity_in_usd: 1000,
      },
    ];
    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue(
      kongSwapTickers
    );

    // Depends on the `snsAggregatorUrl` set in `vi-setup.ts`.
    const aggUrlRegex =
      /https:\/\/5v72r-4aaaa-aaaaa-aabnq-cai\.small12\.testnet\.dfinity\.network\/v1\/sns\/list\/page\/(.)\/slow\.json/;

    const mockFetch = vi.fn();
    mockFetch.mockImplementation(async (url: string | URL) => {
      const urlString = typeof url === "string" ? url : url.toString();

      // Handle SNS aggregator URLs
      const match = urlString.match(aggUrlRegex);
      if (match) {
        const [_, page] = match;
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
        } catch (_) {
          // Return an empty list if importing fails.
          // That will happen with the last page requested has exactly ten projects.
          return {
            ok: true,
            json: () => Promise.resolve([]),
          };
        }
      }

      // Default fallback for any other URLs
      return {
        ok: true,
        json: () => Promise.resolve([]),
      };
    });
    global.fetch = mockFetch;
  });

  it("loads with prod data", async () => {
    const { container } = render(Launchpad);

    const po = Launchpad2Po.under(new JestPageObjectElement(container));

    await runResolvedPromises();

    expect(
      (await po.getFeaturedProjectsCardListPo().getCardEntries()).length
    ).toBeGreaterThan(0);

    expect(get(toastsStore).length).toBe(0);
  });
});
