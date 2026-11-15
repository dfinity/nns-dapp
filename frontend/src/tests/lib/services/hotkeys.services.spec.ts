import * as governanceApi from "$lib/api/governance.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { changeHotkeyOnNeurons } from "$lib/services/hotkeys.services";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import {
  SnsNeuronPermissionType,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";

describe("hotkeys.services", () => {
  const oldHotkey = principal(1);
  const newHotkey = principal(2);
  const rootCanisterId = principal(10);
  const snsUniverseId = rootCanisterId.toText();
  const replace = {
    type: "replace" as const,
    principal: oldHotkey.toText(),
    newPrincipal: newHotkey.toText(),
  };
  const remove = { type: "remove" as const, principal: oldHotkey.toText() };

  const nnsNeuron = (neuronId: bigint, hotKeys: Principal[]): NeuronInfo => ({
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockFullNeuron,
      id: neuronId,
      controller: mockIdentity.getPrincipal().toText(),
      hotKeys: hotKeys.map((hotkey) => hotkey.toText()),
    },
  });

  const snsNeuron = (
    id: number,
    permissions: { principal: Principal; permissions: number[] }[]
  ) =>
    createMockSnsNeuron({
      id: [id],
      permissions: [
        {
          principal: mockIdentity.getPrincipal(),
          permissions: [
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS,
          ],
        },
        ...permissions,
      ].map(({ principal, permissions }) => ({
        principal: [principal],
        permission_type: Int32Array.from(permissions),
      })),
    });

  const nnsRef = (neuronId: bigint) => ({
    universeId: OWN_CANISTER_ID_TEXT,
    neuronId: neuronId.toString(),
  });
  const snsRef = (neuron: SnsGovernanceDid.Neuron) => ({
    universeId: snsUniverseId,
    neuronId: getSnsNeuronIdAsHexString(neuron),
  });

  const setNnsNeurons = (neurons: NeuronInfo[]) =>
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue(neurons);
  const setSnsNeurons = (neurons: SnsGovernanceDid.Neuron[]) =>
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue(neurons);

  let spyAddHotkey;
  let spyRemoveHotkey;
  let spyAddPermissions;
  let spyRemovePermissions;

  beforeEach(() => {
    resetIdentity();
    setSnsProjects([
      {
        rootCanisterId,
        nervousSystemParameters: {
          ...aggregatorSnsMockDto.nervous_system_parameters,
          max_number_of_principals_per_neuron: 3,
        },
      },
    ]);
    spyAddHotkey = vi.spyOn(governanceApi, "addHotkey").mockResolvedValue();
    spyRemoveHotkey = vi
      .spyOn(governanceApi, "removeHotkey")
      .mockResolvedValue();
    spyAddPermissions = vi
      .spyOn(snsGovernanceApi, "addNeuronPermissions")
      .mockResolvedValue();
    spyRemovePermissions = vi
      .spyOn(snsGovernanceApi, "removeNeuronPermissions")
      .mockResolvedValue();
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([]);
  });

  describe("NNS neurons", () => {
    it("should add the new hotkey before it removes the old one", async () => {
      setNnsNeurons([nnsNeuron(1n, [oldHotkey])]);

      const results = await changeHotkeyOnNeurons({
        change: replace,
        neurons: [nnsRef(1n)],
      });

      expect(results).toEqual([{ ...nnsRef(1n), success: true }]);
      expect(spyAddHotkey).toHaveBeenCalledWith({
        neuronId: 1n,
        identity: mockIdentity,
        principal: newHotkey,
      });
      expect(spyRemoveHotkey).toHaveBeenCalledWith({
        neuronId: 1n,
        identity: mockIdentity,
        principal: oldHotkey,
      });
      expect(spyAddHotkey.mock.invocationCallOrder[0]).toBeLessThan(
        spyRemoveHotkey.mock.invocationCallOrder[0]
      );
    });

    it("should remove the old hotkey first on a neuron with 10 hotkeys", async () => {
      setNnsNeurons([
        nnsNeuron(1n, [
          oldHotkey,
          ...Array.from({ length: 9 }, (_, i) => principal(100 + i)),
        ]),
      ]);

      await changeHotkeyOnNeurons({ change: replace, neurons: [nnsRef(1n)] });

      expect(spyRemoveHotkey.mock.invocationCallOrder[0]).toBeLessThan(
        spyAddHotkey.mock.invocationCallOrder[0]
      );
    });

    it("should only do the missing steps", async () => {
      setNnsNeurons([nnsNeuron(1n, [oldHotkey, newHotkey]), nnsNeuron(2n, [])]);

      await changeHotkeyOnNeurons({
        change: replace,
        neurons: [nnsRef(1n), nnsRef(2n)],
      });

      expect(spyRemoveHotkey).toHaveBeenCalledTimes(1);
      expect(spyRemoveHotkey).toHaveBeenCalledWith(
        expect.objectContaining({ neuronId: 1n })
      );
      expect(spyAddHotkey).toHaveBeenCalledTimes(1);
      expect(spyAddHotkey).toHaveBeenCalledWith(
        expect.objectContaining({ neuronId: 2n })
      );
    });

    it("should remove the hotkey", async () => {
      setNnsNeurons([nnsNeuron(1n, [oldHotkey])]);

      await changeHotkeyOnNeurons({ change: remove, neurons: [nnsRef(1n)] });

      expect(spyRemoveHotkey).toHaveBeenCalledWith({
        neuronId: 1n,
        identity: mockIdentity,
        principal: oldHotkey,
      });
      expect(spyAddHotkey).not.toHaveBeenCalled();
    });
  });

  describe("SNS neurons", () => {
    const fundHotkeyPermissions = [
      ...HOTKEY_PERMISSIONS,
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
    ];

    it("should give the new hotkey the hotkey permissions and remove all the permissions of the old one", async () => {
      const neuron = snsNeuron(1, [
        { principal: oldHotkey, permissions: fundHotkeyPermissions },
      ]);
      setSnsNeurons([neuron]);

      const results = await changeHotkeyOnNeurons({
        change: replace,
        neurons: [snsRef(neuron)],
      });

      expect(results).toEqual([{ ...snsRef(neuron), success: true }]);
      expect(spyAddPermissions).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId,
        permissions: HOTKEY_PERMISSIONS,
        principal: newHotkey,
        neuronId: neuron.id[0],
      });
      expect(spyRemovePermissions).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId,
        permissions: fundHotkeyPermissions,
        principal: oldHotkey,
        neuronId: neuron.id[0],
      });
      expect(spyAddPermissions.mock.invocationCallOrder[0]).toBeLessThan(
        spyRemovePermissions.mock.invocationCallOrder[0]
      );
    });

    it("should remove the old hotkey first on a neuron with the maximum number of principals", async () => {
      const neuron = snsNeuron(1, [
        { principal: oldHotkey, permissions: HOTKEY_PERMISSIONS },
        { principal: principal(100), permissions: HOTKEY_PERMISSIONS },
      ]);
      setSnsNeurons([neuron]);

      await changeHotkeyOnNeurons({
        change: replace,
        neurons: [snsRef(neuron)],
      });

      expect(spyRemovePermissions.mock.invocationCallOrder[0]).toBeLessThan(
        spyAddPermissions.mock.invocationCallOrder[0]
      );
    });

    it("should remove all the permissions of the hotkey", async () => {
      const neuron = snsNeuron(1, [
        { principal: oldHotkey, permissions: fundHotkeyPermissions },
      ]);
      setSnsNeurons([neuron]);

      await changeHotkeyOnNeurons({
        change: remove,
        neurons: [snsRef(neuron)],
      });

      expect(spyRemovePermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: fundHotkeyPermissions,
          principal: oldHotkey,
        })
      );
      expect(spyAddPermissions).not.toHaveBeenCalled();
    });
  });

  it("should report each failed neuron and change the others", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    setNnsNeurons([nnsNeuron(1n, [oldHotkey]), nnsNeuron(2n, [oldHotkey])]);
    spyRemoveHotkey.mockImplementation(async ({ neuronId }) => {
      if (neuronId === 1n) {
        throw new Error("remove failed");
      }
    });

    const results = await changeHotkeyOnNeurons({
      change: remove,
      neurons: [nnsRef(1n), nnsRef(2n)],
    });

    expect(results).toEqual([
      { ...nnsRef(1n), success: false },
      { ...nnsRef(2n), success: true },
    ]);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("should load the certified neurons before it changes them", async () => {
    const neuron = snsNeuron(1, [
      { principal: oldHotkey, permissions: HOTKEY_PERMISSIONS },
    ]);
    setNnsNeurons([nnsNeuron(1n, [oldHotkey])]);
    setSnsNeurons([neuron]);

    await changeHotkeyOnNeurons({
      change: remove,
      neurons: [nnsRef(1n), snsRef(neuron)],
    });

    expect(governanceApi.queryNeurons).toHaveBeenCalledTimes(1);
    expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
      identity: mockIdentity,
      certified: true,
      includeEmptyNeurons: false,
    });
    expect(snsGovernanceApi.querySnsNeurons).toHaveBeenCalledTimes(1);
    expect(snsGovernanceApi.querySnsNeurons).toHaveBeenCalledWith({
      identity: mockIdentity,
      rootCanisterId,
      certified: true,
    });
  });

  it("should fail the neurons of a universe that does not load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const neuron = snsNeuron(1, [
      { principal: oldHotkey, permissions: HOTKEY_PERMISSIONS },
    ]);
    setNnsNeurons([nnsNeuron(1n, [oldHotkey])]);
    vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockRejectedValue(
      new Error("SNS neurons failed")
    );

    const results = await changeHotkeyOnNeurons({
      change: remove,
      neurons: [nnsRef(1n), snsRef(neuron)],
    });

    expect(results).toEqual([
      { ...nnsRef(1n), success: true },
      { ...snsRef(neuron), success: false },
    ]);
    expect(spyRemoveHotkey).toHaveBeenCalledTimes(1);
    expect(spyRemovePermissions).not.toHaveBeenCalled();
  });
});
