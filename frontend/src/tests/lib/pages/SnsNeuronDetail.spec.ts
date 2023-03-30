/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import {
  getSnsNeuronIdAsHexString,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import * as fakeSnsLedgerApi from "$tests/fakes/sns-ledger-api.fake";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsNeuronDetailPo } from "$tests/page-objects/SnsNeuronDetail.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle, type SnsNeuronId } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/api/sns-ledger.api");

describe("SnsNeuronDetail", () => {
  fakeSnsGovernanceApi.install();
  fakeSnsLedgerApi.install();

  const rootCanisterId = rootCanisterIdMock;
  const responses = snsResponseFor({
    principal: rootCanisterId,
    lifecycle: SnsSwapLifecycle.Committed,
  });
  const projectName = "Test SNS";
  // Clone the summary to avoid mutating the mock
  const summary = { ...responses[0][0] };
  summary.metadata.name = [projectName];
  responses[0][0] = summary;

  beforeEach(() => {
    jest.clearAllMocks();
    snsParametersStore.reset();
    transactionsFeesStore.reset();
    tokensStore.reset();
    snsFunctionsStore.reset();
    snsParametersStore.reset();
    snsNeuronsStore.reset();
    snsAccountsStore.reset();
    snsQueryStore.reset();
    snsQueryStore.setData(responses);

    page.mock({
      data: { universe: rootCanisterId.toText() },
      routeId: AppPath.Neuron,
    });

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  const renderComponent = async (props) => {
    const { container } = render(SnsNeuronDetail, props);

    await runResolvedPromises();
    return SnsNeuronDetailPo.under(new JestPageObjectElement(container));
  };

  const validNeuronId: SnsNeuronId = {
    id: new Uint8Array([1, 5, 3, 9, 9, 3, 2]),
  };
  const validNeuronIdAsHexString = subaccountToHexString(validNeuronId.id);

  describe("when neuron and projects are valid and present", () => {
    const props = {
      neuronId: validNeuronIdAsHexString,
    };
    beforeEach(() => {
      page.mock({
        data: { universe: rootCanisterIdMock.toText() },
        routeId: AppPath.Neuron,
      });

      fakeSnsGovernanceApi.addNeuronWith({
        identity: mockIdentity,
        rootCanisterId,
        id: [validNeuronId],
      });
    });

    it("should load neuron details", async () => {
      const po = await renderComponent(props);

      expect(await po.isContentLoaded()).toBe(true);
    });

    it("should render sns project name", async () => {
      const po = await renderComponent(props);

      expect(await (await po.getTitle()).trim()).toBe(projectName);
    });

    it("should render cards", async () => {
      const po = await renderComponent(props);

      expect(await po.getMetaInfoCardPo().isPresent()).toBe(true);
      expect(await po.getHotkeysCardPo().isPresent()).toBe(true);
      expect(await po.getMetaInfoCardPo().isPresent()).toBe(true);
      expect(await po.getStakeCardPo().isPresent()).toBe(true);
      expect(await po.getFollowingCardPo().isPresent()).toBe(true);
    });
  });

  describe("when project is an invalid canister id", () => {
    beforeEach(() => page.mock({ data: { universe: "invalid-project-id" } }));

    const props = {
      neuronId: getSnsNeuronIdAsHexString(mockSnsNeuron),
    };

    it("should redirect", async () => {
      render(SnsNeuronDetail, props);

      await waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Neurons);
      });
    });
  });

  describe("when neuron is not found", () => {
    beforeEach(() => page.mock({ data: { universe: "invalid-project-id" } }));

    const props = {
      neuronId: getSnsNeuronIdAsHexString(mockSnsNeuron),
    };

    it("should redirect", async () => {
      render(SnsNeuronDetail, props);

      await waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Neurons);
      });
    });
  });
});
