/**
 * @jest-environment jsdom
 */

import * as governanceApi from "$lib/api/governance.api";
import * as snsAggregatorApi from "$lib/api/sns-aggregator.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import * as snsApi from "$lib/api/sns.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { snsQueryStore } from "$lib/stores/sns.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { aggregatorSnsMockWith } from "$tests/mocks/sns-aggregator.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

jest.mock("$lib/api/governance.api");
jest.mock("$lib/api/sns-aggregator.api");
jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/api/sns-ledger.api");
jest.mock("$lib/api/sns.api");

const blockedApiPaths = [
  "$lib/api/sns-aggregator.api",
  "$lib/api/governance.api",
  "$lib/api/sns.api",
  "$lib/api/sns-ledger.api",
  "$lib/api/sns-governance.api",
];

const testCommittedSnsCanisterId = Principal.fromHex("897654");
const testOpenSnsCanisterId = Principal.fromHex("567812");

const testFee = BigInt(25000);

describe("Neurons", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(async () => {
    snsQueryStore.reset();

    jest.mocked(governanceApi.queryNeurons).mockResolvedValue([mockNeuron]);
    jest
      .mocked(snsGovernanceApi.nervousSystemParameters)
      .mockResolvedValue(snsNervousSystemParametersMock);
    jest.mocked(snsApi.querySnsNeurons).mockResolvedValue([mockSnsNeuron]);
    jest.mocked(snsGovernanceApi.getNeuronBalance).mockResolvedValue(BigInt(0));
    jest
      .mocked(snsLedgerApi.getSnsAccounts)
      .mockResolvedValue([mockSnsMainAccount]);
    jest.mocked(snsGovernanceApi.refreshNeuron).mockResolvedValue(undefined);
    jest.mocked(snsApi.getSnsNeuron).mockResolvedValue(mockSnsNeuron);
    jest.mocked(snsLedgerApi.getSnsToken).mockResolvedValue(mockSnsToken);
    jest.mocked(snsAggregatorApi.querySnsProjects).mockResolvedValue([
      aggregatorSnsMockWith({
        rootCanisterId: testCommittedSnsCanisterId.toText(),
        lifecycle: SnsSwapLifecycle.Committed,
      }),
      aggregatorSnsMockWith({
        rootCanisterId: testOpenSnsCanisterId.toText(),
        lifecycle: SnsSwapLifecycle.Open,
      }),
    ]);

    await loadSnsProjects();
  });

  it("should render NnsNeurons by default", async () => {
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(container);

    expect(po.hasSnsNeurons()).toBe(false);
    expect(po.hasNnsNeurons()).toBe(true);
    expect(po.getNnsNeurons().isContentLoaded()).toBe(false);
    await waitFor(() => {
      expect(po.getNnsNeurons().isContentLoaded()).toBe(true);
    });

    const neuronIdText = mockNeuron.neuronId.toString();
    expect(po.getNnsNeurons().getNeuronIds()).toContain(neuronIdText);
  });

  it("should render project page when a committed project is selected", async () => {
    page.mock({
      data: { universe: testCommittedSnsCanisterId.toText() },
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(container);

    expect(po.hasNnsNeurons()).toBe(false);
    expect(po.hasSnsNeurons()).toBe(true);
    expect(po.getSnsNeurons().isContentLoaded()).toBe(false);
    await waitFor(() => {
      expect(po.getSnsNeurons().isContentLoaded()).toBe(true);
    });

    const neuronIdText = getSnsNeuronIdAsHexString(mockSnsNeuron);
    expect(po.getSnsNeurons().getNeuronIds()).toContain(neuronIdText);
  });

  it("should not render neurons when an open project is selected", async () => {
    page.mock({
      data: { universe: testOpenSnsCanisterId.toText() },
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(container);

    expect(po.hasNnsNeurons()).toBe(false);
    expect(po.hasSnsNeurons()).toBe(true);
    expect(po.getSnsNeurons().isContentLoaded()).toBe(false);
    await waitFor(() => {
      expect(po.getSnsNeurons().isContentLoaded()).toBe(true);
    });

    const neuronIdText = getSnsNeuronIdAsHexString(mockSnsNeuron);
    // This should actually fail but doesn't because of
    // https://dfinity.atlassian.net/browse/GIX-1328
    expect(po.getSnsNeurons().getNeuronIds()).toContain(neuronIdText);
  });
});
