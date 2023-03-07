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
import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { snsQueryStore } from "$lib/stores/sns.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { aggregatorSnsMockWith } from "$tests/mocks/sns-aggregator.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { NeuronDetailPo } from "$tests/page-objects/NeuronDetail.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

jest.mock("$lib/api/sns-aggregator.api");
jest.mock("$lib/api/governance.api");
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

const testSnsCanisterId = Principal.fromHex("123321");
const testFee = BigInt(25000);
const testSnsNeuronId = getSnsNeuronIdAsHexString(mockSnsNeuron);
const testNnsNeuronId = mockNeuron.neuronId;

const snsProps = {
  neuronId: testSnsNeuronId,
};

const nnsProps = {
  neuronId: testNnsNeuronId,
};

describe("NeuronDetail", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    snsQueryStore.reset();
  });

  describe("nns neuron", () => {
    beforeEach(() => {
      jest.mocked(governanceApi.queryNeurons).mockResolvedValue([mockNeuron]);
      jest.mocked(governanceApi.queryKnownNeurons).mockResolvedValue([]);
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Neuron,
      });
    });

    it("should load", async () => {
      const { container } = render(NeuronDetail, nnsProps);
      const po = NeuronDetailPo.under(container);

      expect(po.hasSnsNeuronDetail()).toBe(false);
      expect(po.hasNnsNeuronDetail()).toBe(true);
      expect(po.getNnsNeuronDetail().isContentLoaded()).toBe(true);
    });
  });

  describe("sns neuron", () => {
    beforeEach(() => {
      jest.mocked(snsAggregatorApi.querySnsProjects).mockResolvedValue([
        aggregatorSnsMockWith({
          rootCanisterId: testSnsCanisterId.toText(),
          lifecycle: SnsSwapLifecycle.Committed,
        }),
      ]);
      jest
        .mocked(snsGovernanceApi.nervousSystemParameters)
        .mockResolvedValue(snsNervousSystemParametersMock);
      jest.mocked(snsLedgerApi.transactionFee).mockResolvedValue(testFee);
      jest.mocked(snsApi.getSnsNeuron).mockResolvedValue(mockSnsNeuron);
      jest
        .mocked(snsGovernanceApi.getNervousSystemFunctions)
        .mockResolvedValue([]);
      jest
        .mocked(snsGovernanceApi.getNeuronBalance)
        .mockResolvedValue(10_000_000_000n);
      jest.mocked(snsGovernanceApi.refreshNeuron).mockResolvedValue(undefined);

      page.mock({
        data: { universe: testSnsCanisterId.toText() },
        routeId: AppPath.Neuron,
      });
    });

    it("should load", async () => {
      await loadSnsProjects();
      const { container } = render(NeuronDetail, snsProps);

      const po = NeuronDetailPo.under(container);
      expect(po.isContentLoaded()).toBe(true);
      expect(po.hasNnsNeuronDetail()).toBe(false);
      expect(po.hasSnsNeuronDetail()).toBe(true);
      expect(po.getSnsNeuronDetail().isContentLoaded()).toBe(true);
    });

    it("should load if sns projects are loaded after initial rendering", async () => {
      const { container } = render(NeuronDetail, snsProps);
      const po = NeuronDetailPo.under(container);
      expect(po.isContentLoaded()).toBe(false);

      // Load SNS projects after rendering to make sure we don't load
      // NnsNeuronDetail instead, which was a bug we had.
      await loadSnsProjects();
      expect(po.isContentLoaded()).toBe(true);
      expect(po.hasNnsNeuronDetail()).toBe(false);
      expect(po.hasSnsNeuronDetail()).toBe(true);
      expect(po.getSnsNeuronDetail().isContentLoaded()).toBe(true);
    });
  });
});
