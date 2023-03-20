/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { snsQueryStore } from "$lib/stores/sns.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import * as fakeSnsAggregatorApi from "$tests/fakes/sns-aggregator-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import * as fakeSnsLedgerApi from "$tests/fakes/sns-ledger-api.fake";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronDetailPo } from "$tests/page-objects/NeuronDetail.page-object";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

jest.mock("$lib/api/sns-aggregator.api");
jest.mock("$lib/api/governance.api");
jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/api/sns-ledger.api");
jest.mock("$lib/api/sns.api");

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
    snsQueryStore.reset();
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
      const { container } = render(NeuronDetail, nnsProps);
      const po = NeuronDetailPo.under(container);

      expect(po.hasSnsNeuronDetailPo()).toBe(false);
      expect(po.hasNnsNeuronDetailPo()).toBe(true);
      expect(po.getNnsNeuronDetailPo().isContentLoaded()).toBe(false);
      await waitFor(() => {
        expect(po.getNnsNeuronDetailPo().isContentLoaded()).toBe(true);
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
      const { container } = render(NeuronDetail, { neuronId: testSnsNeuronId });

      const po = NeuronDetailPo.under(container);
      expect(po.isContentLoaded()).toBe(false);
      await waitFor(() => {
        expect(po.isContentLoaded()).toBe(true);
      });
      expect(po.hasNnsNeuronDetailPo()).toBe(false);
      expect(po.hasSnsNeuronDetailPo()).toBe(true);
      expect(po.getSnsNeuronDetailPo().isContentLoaded()).toBe(true);
    });

    it("should load if sns projects are loaded after initial rendering", async () => {
      const { container } = render(NeuronDetail, { neuronId: testSnsNeuronId });
      const po = NeuronDetailPo.under(container);
      expect(po.isContentLoaded()).toBe(false);

      // Load SNS projects after rendering to make sure we don't load
      // NnsNeuronDetail instead, which was a bug we had.
      await loadSnsProjects();
      expect(po.isContentLoaded()).toBe(false);
      await waitFor(() => {
        expect(po.isContentLoaded()).toBe(true);
      });
      expect(po.hasNnsNeuronDetailPo()).toBe(false);
      expect(po.hasSnsNeuronDetailPo()).toBe(true);
      expect(po.getSnsNeuronDetailPo().isContentLoaded()).toBe(true);
    });
  });
});
