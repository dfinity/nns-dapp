import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as proposalsApi from "$lib/api/proposals.api";
import * as snsApi from "$lib/api/sns.api";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import LaunchpadPage from "$routes/(app)/(nns)/launchpad/+page.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import {
  mockSnsSwapCommitment,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Launchpad2Po } from "$tests/page-objects/Launchpad2.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@icp-sdk/canisters/sns";
import { AnonymousIdentity } from "@icp-sdk/core/agent";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";

describe("Launchpad page", () => {
  const renderPage = async () => {
    const { container } = render(LaunchpadPage);
    await runResolvedPromises();
    await tick();
    return Launchpad2Po.under(new JestPageObjectElement(container));
  };

  const tickers = [
    {
      ...mockIcpSwapTicker,
      base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
      last_price: "10.00",
    },
  ];

  beforeEach(() => {
    // Test only the redesign of the Launchpad, since the old one contains no logic on this level (and is deprecated).
    overrideFeatureFlagsStore.setFlag("ENABLE_LAUNCHPAD_REDESIGN", true);

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);
    vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue([]);
  });

  it("should load ICP Swap tickers", async () => {
    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    await renderPage();

    expect(get(icpSwapTickersStore)).toEqual(tickers);
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
  });

  it("should load Swap commitments after login", async () => {
    const sns1RootCanisterId = principal(1);
    const sns2RootCanisterId = principal(2);
    setSnsProjects([
      {
        rootCanisterId: sns1RootCanisterId,
        lifecycle: SnsSwapLifecycle.Open,
      },
      {
        rootCanisterId: sns2RootCanisterId,
        lifecycle: SnsSwapLifecycle.Adopted,
      },
    ]);

    const querySnsSwapCommitmentSpy = vi
      .spyOn(snsApi, "querySnsSwapCommitment")
      .mockResolvedValue(mockSnsSwapCommitment(principal(1)));

    await renderPage();

    expect(querySnsSwapCommitmentSpy).toBeCalledTimes(0);

    resetIdentity();
    await runResolvedPromises();

    expect(querySnsSwapCommitmentSpy).toBeCalledTimes(4);
    expect(querySnsSwapCommitmentSpy).toHaveBeenCalledWith({
      certified: false,
      identity: mockIdentity,
      rootCanisterId: sns1RootCanisterId.toText(),
    });
    expect(querySnsSwapCommitmentSpy).toHaveBeenCalledWith({
      certified: true,
      identity: mockIdentity,
      rootCanisterId: sns1RootCanisterId.toText(),
    });
    expect(querySnsSwapCommitmentSpy).toHaveBeenCalledWith({
      certified: false,
      identity: mockIdentity,
      rootCanisterId: sns2RootCanisterId.toText(),
    });
    expect(querySnsSwapCommitmentSpy).toHaveBeenCalledWith({
      certified: true,
      identity: mockIdentity,
      rootCanisterId: sns2RootCanisterId.toText(),
    });
  });

  it("should load sns proposals", async () => {
    await renderPage();

    expect(proposalsApi.queryProposals).toBeCalledTimes(1);
    expect(proposalsApi.queryProposals).toHaveBeenCalledWith({
      certified: false,
      identity: new AnonymousIdentity(),
      beforeProposal: undefined,
      includeStatus: [1],
      includeTopics: [14],
      omitLargeFields: false,
    });
  });
});
