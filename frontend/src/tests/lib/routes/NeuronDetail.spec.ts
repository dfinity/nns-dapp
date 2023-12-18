import * as agent from "$lib/api/agent.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import * as fakeSnsAggregatorApi from "$tests/fakes/sns-aggregator-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import * as fakeSnsLedgerApi from "$tests/fakes/sns-ledger-api.fake";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronDetailPo } from "$tests/page-objects/NeuronDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns-aggregator.api");
vi.mock("$lib/api/governance.api");
vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/sns.api");

const testSnsCanisterId = Principal.fromHex("123321");
const testNnsNeuronId = mockNeuron.neuronId;

const nnsProps = {
  neuronId: testNnsNeuronId,
};

describe("NeuronDetail", () => {
  fakeGovernanceApi.install();
  fakeSnsGovernanceApi.install();
  fakeSnsLedgerApi.install();
  fakeSnsAggregatorApi.install();

  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("nns neuron", () => {
    beforeEach(() => {
      fakeGovernanceApi.addNeuronWith({ neuronId: testNnsNeuronId });

      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Neuron,
      });
    });

    it("should load", async () => {
      fakeGovernanceApi.pause();
      const { container } = render(NeuronDetail, nnsProps);
      const po = NeuronDetailPo.under(new JestPageObjectElement(container));

      expect(await po.hasSnsNeuronDetailPo()).toBe(false);
      expect(await po.hasNnsNeuronDetailPo()).toBe(true);
      expect(await po.getNnsNeuronDetailPo().isContentLoaded()).toBe(false);
      fakeGovernanceApi.resume();
      await waitFor(async () => {
        expect(await po.getNnsNeuronDetailPo().isContentLoaded()).toBe(true);
      });
    });
  });

  describe("sns neuron", () => {
    let testSnsNeuronId;

    beforeEach(() => {
      fakeSnsAggregatorApi.addProjectWith({
        rootCanisterId: testSnsCanisterId.toText(),
        lifecycle: SnsSwapLifecycle.Committed,
      });
      fakeSnsAggregatorApi.addProjectWith({
        rootCanisterId: mockPrincipal.toText(),
        lifecycle: SnsSwapLifecycle.Committed,
      });

      const snsNeuron = fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId: testSnsCanisterId,
      });
      testSnsNeuronId = getSnsNeuronIdAsHexString(snsNeuron);

      page.mock({
        data: { universe: testSnsCanisterId.toText() },
        routeId: AppPath.Neuron,
      });
    });

    it("should load", async () => {
      await loadSnsProjects();
      fakeSnsGovernanceApi.pause();
      const { container } = render(NeuronDetail, { neuronId: testSnsNeuronId });

      const po = NeuronDetailPo.under(new JestPageObjectElement(container));
      expect(await po.isContentLoaded()).toBe(false);
      fakeSnsGovernanceApi.resume();
      await waitFor(async () => {
        expect(await po.isContentLoaded()).toBe(true);
      });
      expect(await po.hasNnsNeuronDetailPo()).toBe(false);
      expect(await po.hasSnsNeuronDetailPo()).toBe(true);
      expect(await po.getSnsNeuronDetailPo().isContentLoaded()).toBe(true);
    });

    it("should load if sns projects are loaded after initial rendering", async () => {
      fakeSnsGovernanceApi.pause();
      const { container } = render(NeuronDetail, { neuronId: testSnsNeuronId });
      const po = NeuronDetailPo.under(new JestPageObjectElement(container));
      // No loading data until we load the SNS projects.
      fakeSnsGovernanceApi.resume();
      expect(await po.isContentLoaded()).toBe(false);
      fakeSnsGovernanceApi.pause();

      // Load SNS projects after rendering to make sure we don't load
      // NnsNeuronDetail instead, which was a bug we had.
      await loadSnsProjects();
      fakeSnsGovernanceApi.resume();
      await runResolvedPromises();
      expect(await po.isContentLoaded()).toBe(true);

      expect(await po.hasNnsNeuronDetailPo()).toBe(false);
      expect(await po.hasSnsNeuronDetailPo()).toBe(true);
      expect(await po.getSnsNeuronDetailPo().isContentLoaded()).toBe(true);
    });
  });
});
