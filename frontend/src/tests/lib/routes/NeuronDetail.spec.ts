/**
 * @jest-environment jsdom
 */

import { snsQueryStore } from "$lib/stores/sns.store";
import * as governanceApi from "$lib/api/governance.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import * as snsApi from "$lib/api/sns.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import NeuronDetail from "$lib/routes/NeuronDetail.svelte";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { mockNeuron } from "../../mocks/neurons.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "../../mocks/sns-neurons.mock";
import { snsResponseFor } from "../../mocks/sns-response.mock";
import { NeuronDetailPo } from "../../page-objects/NeuronDetail.page-object";
import { blockAllCallsTo } from "../../utils/module.test-utils";

jest.mock("$lib/api/governance.api");
jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/api/sns-ledger.api");
jest.mock("$lib/api/sns.api");

const blockedApiPaths = [
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
      const [metadata, swapStates] = snsResponseFor({
        principal: testSnsCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      });
      jest.mocked(snsApi.queryAllSnsMetadata).mockResolvedValue(metadata);
      jest.mocked(snsApi.querySnsSwapStates).mockResolvedValue(swapStates);
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
