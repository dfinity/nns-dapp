/**
 * @jest-environment jsdom
 */

import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { increaseStakeNeuron } from "$lib/api/sns.api";
import { AppPath } from "$lib/constants/routes.constants";
import {
  HOTKEY_PERMISSIONS,
  MANAGE_HOTKEY_PERMISSIONS,
} from "$lib/constants/sns-neurons.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsNeuronDetail from "$lib/pages/SnsNeuronDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
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
import { numberToE8s } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import * as fakeSnsApi from "$tests/fakes/sns-api.fake";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import * as fakeSnsLedgerApi from "$tests/fakes/sns-ledger-api.fake";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { SnsNeuronDetailPo } from "$tests/page-objects/SnsNeuronDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle, type SnsNeuronId } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns.api");
jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/api/sns-ledger.api");

describe("SnsNeuronDetail", () => {
  fakeSnsGovernanceApi.install();
  fakeSnsLedgerApi.install();
  fakeSnsApi.install();

  const rootCanisterId = rootCanisterIdMock;
  const responses = snsResponseFor({
    principal: rootCanisterId,
    lifecycle: SnsSwapLifecycle.Committed,
  });
  const projectName = "Test SNS";

  const nonExistingNeuron = createMockSnsNeuron({
    id: [1, 1, 1, 1, 1],
  });
  const nonExistingNeuronId = getSnsNeuronIdAsHexString(nonExistingNeuron);

  // Clone the summary to avoid mutating the mock
  const summary = { ...responses[0][0] };
  summary.metadata.name = [projectName];
  responses[0][0] = summary;

  const mainAccount = {
    owner: mockIdentity.getPrincipal(),
  };

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

    fakeSnsLedgerApi.addAccountWith({
      rootCanisterId,
      principal: mockIdentity.getPrincipal(),
    });

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
  const neuronStake = 1;

  describe("with new settings", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: rootCanisterIdMock.toText() },
        routeId: AppPath.Neuron,
      });

      fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
      });

      overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_SETTINGS", true);
    });

    it("should render new sections", async () => {
      const po = await renderComponent({
        neuronId: validNeuronIdAsHexString,
      });

      // Old cards should not be present
      expect(await po.getMetaInfoCardPo().isPresent()).toBe(false);
      expect(await po.getMaturityCardPo().isPresent()).toBe(false);
      expect(await po.getStakeCardPo().isPresent()).toBe(false);

      expect(await po.getVotingPowerSectionPo().isPresent()).toBe(true);
      expect(await po.getMaturitySectionPo().isPresent()).toBe(true);
      expect(await po.getAdvancedSectionPo().isPresent()).toBe(true);
      expect(await po.getFollowingCardPo().isPresent()).toBe(true);
      expect(await po.getHotkeysCardPo().isPresent()).toBe(true);
    });
  });

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
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
      });

      overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_SETTINGS", false);
    });

    it("should load neuron details", async () => {
      const po = await renderComponent(props);

      expect(await po.isContentLoaded()).toBe(true);
    });

    it("should render sns project name", async () => {
      const po = await renderComponent(props);

      expect(await po.getTitle()).toBe(projectName);
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

  describe("increase stake functionality", () => {
    const props = {
      neuronId: validNeuronIdAsHexString,
    };

    it("should increase neuron stake", async () => {
      fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
      });
      const po = await renderComponent(props);

      // `neuronStake` to string formatted as expected
      expect(await po.getStake()).toBe("1.00");
      const amountToStake = 20;
      fakeSnsGovernanceApi.setNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake + amountToStake),
      });

      await po.increaseStake(amountToStake);
      await runResolvedPromises();

      // `neuronStake` + 10 to string and formatted as expected
      expect(await po.getStake()).toBe("21.00");
      expect(increaseStakeNeuron).toHaveBeenCalledTimes(1);
      expect(increaseStakeNeuron).toHaveBeenCalledWith({
        neuronId: validNeuronId,
        stakeE8s: numberToE8s(amountToStake),
        rootCanisterId,
        identity: mockIdentity,
        source: mainAccount,
      });
    });
  });

  describe("hotkey", () => {
    const props = {
      neuronId: validNeuronIdAsHexString,
    };

    const hotkeyPrincipal =
      "dskxv-lqp33-5g7ev-qesdj-fwwkb-3eze4-6tlur-42rxy-n4gag-6t4a3-tae";

    it("can not be added without permission", async () => {
      fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([]),
          },
        ],
      });
      const po = await renderComponent(props);

      expect(
        await po.getHotkeysCardPo().getAddHotkeyButtonPo().isPresent()
      ).toBe(false);
    });

    it("can be added", async () => {
      fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(MANAGE_HOTKEY_PERMISSIONS),
          },
        ],
      });
      const po = await renderComponent(props);

      expect(
        await po.getHotkeysCardPo().getAddHotkeyButtonPo().isPresent()
      ).toBe(true);
      await po.addHotkey(hotkeyPrincipal);
      await runResolvedPromises();

      expect(await po.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);
    });

    it("can be removed", async () => {
      fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(MANAGE_HOTKEY_PERMISSIONS),
          },
          {
            principal: [Principal.fromText(hotkeyPrincipal)],
            permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
          },
        ],
      });
      const po = await renderComponent(props);

      expect(await po.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

      await po.removeHotkey(hotkeyPrincipal);
      await runResolvedPromises();

      expect(await po.getHotkeyPrincipals()).toEqual([]);
    });

    it("old update response doesn't replace newer state", async () => {
      fakeSnsGovernanceApi.addNeuronWith({
        rootCanisterId,
        id: [validNeuronId],
        cached_neuron_stake_e8s: numberToE8s(neuronStake),
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(MANAGE_HOTKEY_PERMISSIONS),
          },
          {
            principal: [Principal.fromText(hotkeyPrincipal)],
            permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
          },
        ],
      });

      // Delay certified responses for getSnsNeuron
      fakeSnsGovernanceApi.pauseFor(
        ({ functionName, args }) =>
          functionName === "getSnsNeuron" &&
          typeof args[0] === "object" &&
          "certified" in args[0] &&
          args[0].certified === true
      );

      const po = await renderComponent(props);

      // The certified response for the original getSnsNeuron call is pending.
      expect(fakeSnsGovernanceApi.getPendingCallsCount()).toBe(1);

      expect(await po.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

      await po.removeHotkey(hotkeyPrincipal);
      await runResolvedPromises();

      expect(await po.getHotkeyPrincipals()).toEqual([]);

      // Now the certified response for the neuron with hotkey removed is also
      // pending.
      expect(fakeSnsGovernanceApi.getPendingCallsCount()).toBe(2);

      // Now we resolve the certified response from before the hotkey was
      // deleted. It should not cause the hotkey to reappear.
      fakeSnsGovernanceApi.resolvePendingCalls(1);
      await runResolvedPromises();

      expect(await po.getHotkeyPrincipals()).toEqual([]);
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
      expect(snsGovernanceApi.getSnsNeuron).not.toBeCalled();
    });
  });

  describe("when neuron is not found", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: rootCanisterId.toText() },
        routeId: AppPath.Neuron,
      });
    });

    const props = {
      neuronId: nonExistingNeuronId,
    };

    it("should redirect", async () => {
      render(SnsNeuronDetail, props);

      await waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Neurons);
      });
      expect(snsGovernanceApi.getSnsNeuron).toBeCalledTimes(2);
      const expectedParams = {
        identity: mockIdentity,
        rootCanisterId,
        neuronId: fromNullable(nonExistingNeuron.id),
      };
      expect(snsGovernanceApi.getSnsNeuron).toBeCalledWith({
        ...expectedParams,
        certified: false,
      });
      expect(snsGovernanceApi.getSnsNeuron).toBeCalledWith({
        ...expectedParams,
        certified: true,
      });
    });
  });
});
