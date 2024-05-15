import * as agent from "$lib/api/agent.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import * as fakeSnsAggregatorApi from "$tests/fakes/sns-aggregator-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
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
    overrideFeatureFlagsStore.reset();

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
    overrideFeatureFlagsStore.setFlag("ENABLE_NEURONS_TABLE", false);

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
    expect(await po.getNnsNeuronsPo().getNeuronIds()).toContain(neuronIdText);
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
    expect(await po.getSnsNeuronsPo().getNeuronIds()).toContain(neuronIdText);
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
});
