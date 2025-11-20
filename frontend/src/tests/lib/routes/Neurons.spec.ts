import * as agent from "$lib/api/agent.api";
import * as governanceApi from "$lib/api/governance.api";
import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as snsAggregatorApi from "$lib/api/sns-aggregator.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { loadSnsProjects } from "$lib/services/public/sns.services";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import * as fakeSnsAggregatorApi from "$tests/fakes/sns-aggregator-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@icp-sdk/canisters/sns";
import type { HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

// In Vitest 4, we need to use importOriginal to partially mock the module
vi.mock("$lib/api/icrc-ledger.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("$lib/api/icrc-ledger.api")>();
  return {
    ...actual,
  };
});

vi.mock("$lib/api/governance.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("$lib/api/governance.api")>();
  return {
    ...actual,
  };
});

vi.mock("$lib/api/sns-aggregator.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("$lib/api/sns-aggregator.api")>();
  return {
    ...actual,
  };
});

vi.mock("$lib/api/sns-governance.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("$lib/api/sns-governance.api")>();
  return {
    ...actual,
  };
});

vi.mock("$lib/api/sns.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/api/sns.api")>();
  return {
    ...actual,
  };
});

const testCommittedSnsCanisterId = Principal.fromHex("897654");
const testOpenSnsCanisterId = Principal.fromHex("567812");
const testNnsNeuronId = 543n;

const blockedPaths = ["$lib/api/icrc-ledger.api"];

describe("Neurons", () => {
  blockAllCallsTo(blockedPaths, {
    "$lib/api/icrc-ledger.api": icrcLedgerApi,
  });

  fakeGovernanceApi.install(governanceApi);
  fakeSnsGovernanceApi.install(snsGovernanceApi);
  fakeSnsAggregatorApi.install(snsAggregatorApi);

  const tickers = [
    {
      ...mockIcpSwapTicker,
      base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
      last_price: "10.00",
    },
  ];

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

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(0n);
    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockToken);
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
    await runResolvedPromises();
    await tick();

    expect(await po.getSnsNeuronsPo().isContentLoaded()).toBe(true);

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
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    const { container } = render(Neurons);
    const po = NeuronsPo.under(new JestPageObjectElement(container));
    await runResolvedPromises();

    const expectedTickersStore = {
      [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: 1,
      [LEDGER_CANISTER_ID.toText()]: 10,
    };

    expect(get(icpSwapTickersStore)).toEqual(expectedTickersStore);

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
});
