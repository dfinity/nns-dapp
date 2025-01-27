import * as agent from "$lib/api/agent.api";
import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { loadSnsProjects } from "$lib/services/public/sns.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import * as fakeSnsAggregatorApi from "$tests/fakes/sns-aggregator-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/governance.api");
vi.mock("$lib/api/sns-aggregator.api");
vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/sns.api");

const testCommittedSnsCanisterId = Principal.fromHex("897654");
const testOpenSnsCanisterId = Principal.fromHex("567812");
const testNnsNeuronId = 543n;

const blockedPaths = ["$lib/api/icrc-ledger.api"];

describe("Neurons", () => {
  blockAllCallsTo(blockedPaths);

  fakeGovernanceApi.install();
  fakeSnsGovernanceApi.install();
  fakeSnsAggregatorApi.install();

  let testCommittedSnsNeuron;

  beforeEach(async () => {
    resetIdentity();

    fakeGovernanceApi.addNeuronWith({ neuronId: testNnsNeuronId });
    testCommittedSnsNeuron = fakeSnsGovernanceApi.addNeuronWith({
      rootCanisterId: testCommittedSnsCanisterId,
    });
    fakeSnsGovernanceApi.addNeuronWith({
      rootCanisterId: testOpenSnsCanisterId,
    });
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
      mockSnsMainAccount.balanceUlps
    );

    fakeSnsAggregatorApi.addProjectWith({
      rootCanisterId: testCommittedSnsCanisterId.toText(),
      lifecycle: SnsSwapLifecycle.Committed,
    });
    fakeSnsAggregatorApi.addProjectWith({
      rootCanisterId: testOpenSnsCanisterId.toText(),
      lifecycle: SnsSwapLifecycle.Open,
    });
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    await loadSnsProjects();
  });

  it("should render NnsNeurons by default", async () => {
    fakeGovernanceApi.pause();
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(new JestPageObjectElement(container));

    expect(await po.hasSnsNeuronsPo()).toBe(false);
    expect(await po.hasNnsNeuronsPo()).toBe(true);
    expect(await po.getNnsNeuronsPo().isContentLoaded()).toBe(false);
    fakeGovernanceApi.resume();
    await waitFor(async () => {
      expect(await po.getNnsNeuronsPo().isContentLoaded()).toBe(true);
    });

    const neuronIdText = testNnsNeuronId.toString();
    expect(
      await po.getNnsNeuronsPo().getNeuronsTablePo().getNeuronIds()
    ).toContain(neuronIdText);
  });

  it("should render project page when a committed project is selected", async () => {
    fakeSnsGovernanceApi.pause();
    page.mock({
      data: { universe: testCommittedSnsCanisterId.toText() },
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(new JestPageObjectElement(container));

    expect(await po.hasNnsNeuronsPo()).toBe(false);
    expect(await po.hasSnsNeuronsPo()).toBe(true);
    expect(await po.getSnsNeuronsPo().isContentLoaded()).toBe(false);
    fakeSnsGovernanceApi.resume();
    await waitFor(async () => {
      expect(await po.getSnsNeuronsPo().isContentLoaded()).toBe(true);
    });

    const neuronIdText = getSnsNeuronIdAsHexString(testCommittedSnsNeuron);
    expect(
      await po.getSnsNeuronsPo().getNeuronsTablePo().getNeuronIds()
    ).toContain(neuronIdText);
  });

  it("should not render neurons when an open project is selected", async () => {
    page.mock({
      data: { universe: testOpenSnsCanisterId.toText() },
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(new JestPageObjectElement(container));

    expect(await po.hasNnsNeuronsPo()).toBe(false);
    expect(await po.hasSnsNeuronsPo()).toBe(false);
  });

  it("should load ICP Swap tickers", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    const tickers = [
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "10.00",
      },
    ];
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);

    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    const { container } = render(Neurons);
    const po = NeuronsPo.under(new JestPageObjectElement(container));
    await runResolvedPromises();

    expect(get(icpSwapTickersStore)).toEqual(tickers);
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);

    const rows = await po
      .getNnsNeuronsPo()
      .getNeuronsTablePo()
      .getNeuronsTableRowPos();
    expect(rows).toHaveLength(1);
    // The exact value doesn't matter (because it's tested in other tests),
    // just that it's a number.
    expect(await rows[0].getStakeInUsd()).toBe("$300.00");
  });

  it("should not load ICP Swap tickers without feature flag", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", false);
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([]);

    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    const { container } = render(Neurons);
    const po = NeuronsPo.under(new JestPageObjectElement(container));
    await runResolvedPromises();

    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    const rows = await po
      .getNnsNeuronsPo()
      .getNeuronsTablePo()
      .getNeuronsTableRowPos();
    expect(rows).toHaveLength(1);
    expect(await rows[0].hasStakeInUsd()).toBe(false);
  });
});
