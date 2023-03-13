/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { snsQueryStore } from "$lib/stores/sns.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import * as fakeSnsAggregatorApi from "$tests/fakes/sns-aggregator-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import * as fakeSnsLedgerApi from "$tests/fakes/sns-ledger-api.fake";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

jest.mock("$lib/api/governance.api");
jest.mock("$lib/api/sns-aggregator.api");
jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/api/sns-ledger.api");
jest.mock("$lib/api/sns.api");

const testCommittedSnsCanisterId = Principal.fromHex("897654");
const testOpenSnsCanisterId = Principal.fromHex("567812");
const testNnsNeuronId = BigInt(543);

describe("Neurons", () => {
  fakeGovernanceApi.install();
  fakeSnsGovernanceApi.install();
  fakeSnsLedgerApi.install();
  fakeSnsAggregatorApi.install();

  let testCommittedSnsNeuron;
  let testOpenSnsNeuron;

  beforeEach(async () => {
    snsQueryStore.reset();

    fakeGovernanceApi.addNeuronWith({ neuronId: testNnsNeuronId });
    testCommittedSnsNeuron = fakeSnsGovernanceApi.addNeuronWith({
      rootCanisterId: testCommittedSnsCanisterId,
    });
    testOpenSnsNeuron = fakeSnsGovernanceApi.addNeuronWith({
      rootCanisterId: testOpenSnsCanisterId,
    });
    fakeSnsLedgerApi.addAccountWith({
      rootCanisterId: testCommittedSnsCanisterId,
    });

    fakeSnsAggregatorApi.addProjectWith({
      rootCanisterId: testCommittedSnsCanisterId.toText(),
      lifecycle: SnsSwapLifecycle.Committed,
    });
    fakeSnsAggregatorApi.addProjectWith({
      rootCanisterId: testOpenSnsCanisterId.toText(),
      lifecycle: SnsSwapLifecycle.Open,
    });

    await loadSnsProjects();
  });

  it("should render NnsNeurons by default", async () => {
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(container);

    expect(po.hasSnsNeuronsPo()).toBe(false);
    expect(po.hasNnsNeuronsPo()).toBe(true);
    expect(po.getNnsNeuronsPo().isContentLoaded()).toBe(false);
    await waitFor(() => {
      expect(po.getNnsNeuronsPo().isContentLoaded()).toBe(true);
    });

    const neuronIdText = testNnsNeuronId.toString();
    expect(po.getNnsNeuronsPo().getNeuronIds()).toContain(neuronIdText);
  });

  it("should render project page when a committed project is selected", async () => {
    page.mock({
      data: { universe: testCommittedSnsCanisterId.toText() },
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(container);

    expect(po.hasNnsNeuronsPo()).toBe(false);
    expect(po.hasSnsNeuronsPo()).toBe(true);
    expect(po.getSnsNeuronsPo().isContentLoaded()).toBe(false);
    await waitFor(() => {
      expect(po.getSnsNeuronsPo().isContentLoaded()).toBe(true);
    });

    const neuronIdText = getSnsNeuronIdAsHexString(testCommittedSnsNeuron);
    expect(po.getSnsNeuronsPo().getNeuronIds()).toContain(neuronIdText);
  });

  it("should not render neurons when an open project is selected", async () => {
    page.mock({
      data: { universe: testOpenSnsCanisterId.toText() },
    });

    const { container } = render(Neurons);
    const po = NeuronsPo.under(container);

    expect(po.hasNnsNeuronsPo()).toBe(false);
    expect(po.hasSnsNeuronsPo()).toBe(false);
  });
});
