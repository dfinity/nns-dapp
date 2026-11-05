import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import type { Universe } from "$lib/types/universe";
import { getHotkeys } from "$lib/utils/hotkeys.utils";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import { SnsNeuronPermissionType } from "@icp-sdk/canisters/sns";
import { Principal } from "@icp-sdk/core/principal";

describe("hotkeys.utils", () => {
  const hotkeyA = principal(1).toText();
  const hotkeyB = principal(2).toText();
  const userPrincipal = principal(3).toText();

  const nnsUniverse: Universe = {
    canisterId: OWN_CANISTER_ID_TEXT,
    title: "Internet Computer",
    logo: "icp-logo",
  };
  const sns1Universe: Universe = {
    canisterId: principal(10).toText(),
    title: "SNS-1",
    logo: "sns-1-logo",
  };
  const sns2Universe: Universe = {
    canisterId: principal(11).toText(),
    title: "SNS-2",
    logo: "sns-2-logo",
  };
  const universes = [nnsUniverse, sns1Universe, sns2Universe];

  const nnsNeuron = ({
    neuronId,
    hotKeys,
  }: {
    neuronId: bigint;
    hotKeys: string[];
  }): NeuronInfo => ({
    ...mockNeuron,
    neuronId,
    fullNeuron: { ...mockFullNeuron, id: neuronId, hotKeys },
  });

  const snsNeuron = ({
    id,
    permissions,
  }: {
    id: number;
    permissions: { principal: Principal; permissions: number[] }[];
  }) =>
    createMockSnsNeuron({
      id: [id],
      permissions: permissions.map(({ principal, permissions }) => ({
        principal: [principal],
        permission_type: Int32Array.from(permissions),
      })),
    });

  const snsHotkey = (principalText: string) => ({
    principal: Principal.fromText(principalText),
    permissions: HOTKEY_PERMISSIONS,
  });

  it("should return an empty list without neurons", () => {
    expect(
      getHotkeys({
        nnsNeurons: [],
        snsNeurons: {},
        universes,
        excludedPrincipal: userPrincipal,
      })
    ).toEqual([]);
  });

  it("should group the hotkeys of NNS and SNS neurons by principal", () => {
    expect(
      getHotkeys({
        nnsNeurons: [
          nnsNeuron({ neuronId: 1n, hotKeys: [hotkeyA] }),
          nnsNeuron({ neuronId: 2n, hotKeys: [hotkeyA, hotkeyB] }),
        ],
        snsNeurons: {
          [sns2Universe.canisterId]: {
            neurons: [
              snsNeuron({ id: 1, permissions: [snsHotkey(hotkeyA)] }),
              snsNeuron({ id: 2, permissions: [snsHotkey(hotkeyA)] }),
            ],
            certified: true,
          },
        },
        universes,
        excludedPrincipal: userPrincipal,
      })
    ).toEqual([
      {
        principal: hotkeyA,
        neuronCount: 4,
        projects: [
          { universe: nnsUniverse, neuronCount: 2 },
          { universe: sns2Universe, neuronCount: 2 },
        ],
      },
      {
        principal: hotkeyB,
        neuronCount: 1,
        projects: [{ universe: nnsUniverse, neuronCount: 1 }],
      },
    ]);
  });

  it("should not list the excluded principal", () => {
    expect(
      getHotkeys({
        nnsNeurons: [
          nnsNeuron({ neuronId: 1n, hotKeys: [userPrincipal, hotkeyA] }),
        ],
        snsNeurons: {
          [sns1Universe.canisterId]: {
            neurons: [
              snsNeuron({ id: 1, permissions: [snsHotkey(userPrincipal)] }),
            ],
            certified: true,
          },
        },
        universes,
        excludedPrincipal: userPrincipal,
      }).map(({ principal }) => principal)
    ).toEqual([hotkeyA]);
  });

  it("should not list SNS principals that are not hotkeys", () => {
    expect(
      getHotkeys({
        nnsNeurons: [],
        snsNeurons: {
          [sns1Universe.canisterId]: {
            neurons: [
              snsNeuron({
                id: 1,
                permissions: [
                  {
                    principal: Principal.fromText(hotkeyA),
                    permissions: [
                      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
                    ],
                  },
                ],
              }),
            ],
            certified: true,
          },
        },
        universes,
        excludedPrincipal: userPrincipal,
      })
    ).toEqual([]);
  });

  it("should ignore the neurons of unknown universes", () => {
    expect(
      getHotkeys({
        nnsNeurons: [],
        snsNeurons: {
          [principal(99).toText()]: {
            neurons: [snsNeuron({ id: 1, permissions: [snsHotkey(hotkeyA)] })],
            certified: true,
          },
        },
        universes,
        excludedPrincipal: userPrincipal,
      })
    ).toEqual([]);
  });

  it("should list the projects in the order of the universes", () => {
    const [hotkey] = getHotkeys({
      nnsNeurons: [nnsNeuron({ neuronId: 1n, hotKeys: [hotkeyA] })],
      snsNeurons: {
        [sns2Universe.canisterId]: {
          neurons: [snsNeuron({ id: 1, permissions: [snsHotkey(hotkeyA)] })],
          certified: true,
        },
        [sns1Universe.canisterId]: {
          neurons: [snsNeuron({ id: 1, permissions: [snsHotkey(hotkeyA)] })],
          certified: true,
        },
      },
      universes,
      excludedPrincipal: userPrincipal,
    });

    expect(hotkey.projects.map(({ universe }) => universe.title)).toEqual([
      "Internet Computer",
      "SNS-1",
      "SNS-2",
    ]);
  });

  it("should sort hotkeys with the same neuron count by principal", () => {
    expect(
      getHotkeys({
        nnsNeurons: [nnsNeuron({ neuronId: 1n, hotKeys: [hotkeyB, hotkeyA] })],
        snsNeurons: {},
        universes,
        excludedPrincipal: undefined,
      }).map(({ principal }) => principal)
    ).toEqual([hotkeyA, hotkeyB].sort());
  });
});
