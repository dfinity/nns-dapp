import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import type { SnsParametersStore } from "$lib/derived/sns-parameters.derived";
import type { Universe } from "$lib/types/universe";
import { getHotkeys } from "$lib/utils/hotkeys.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import {
  SnsNeuronPermissionType,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";

describe("hotkeys.utils", () => {
  const hotkeyA = principal(1);
  const hotkeyB = principal(2);
  const userPrincipal = mockIdentity.getPrincipal();

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

  const parametersWithHotkeys: SnsGovernanceDid.NervousSystemParameters = {
    ...snsNervousSystemParametersMock,
    neuron_grantable_permissions: [
      { permissions: Int32Array.from(HOTKEY_PERMISSIONS) },
    ],
  };
  const snsParameters: SnsParametersStore = {
    [sns1Universe.canisterId]: { parameters: parametersWithHotkeys },
    [sns2Universe.canisterId]: { parameters: parametersWithHotkeys },
  };

  const nnsNeuron = ({
    neuronId,
    hotKeys,
    controller = userPrincipal.toText(),
  }: {
    neuronId: bigint;
    hotKeys: Principal[];
    controller?: string;
  }): NeuronInfo => ({
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockFullNeuron,
      id: neuronId,
      controller,
      hotKeys: hotKeys.map((hotkey) => hotkey.toText()),
    },
  });

  const snsNeuron = ({
    id,
    hotkeys = [],
    otherPermissions = [],
    userPermissions = [
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS,
    ],
  }: {
    id: number;
    hotkeys?: Principal[];
    otherPermissions?: { principal: Principal; permissions: number[] }[];
    userPermissions?: number[];
  }) =>
    createMockSnsNeuron({
      id: [id],
      permissions: [
        { principal: userPrincipal, permissions: userPermissions },
        ...hotkeys.map((hotkey) => ({
          principal: hotkey,
          permissions: HOTKEY_PERMISSIONS,
        })),
        ...otherPermissions,
      ].map(({ principal, permissions }) => ({
        principal: [principal],
        permission_type: Int32Array.from(permissions),
      })),
    });

  const snsNeuronId = (id: number) =>
    getSnsNeuronIdAsHexString(createMockSnsNeuron({ id: [id] }));

  const getAllHotkeys = ({
    nnsNeurons = [],
    snsNeurons = {},
    parameters = snsParameters,
  }: {
    nnsNeurons?: NeuronInfo[];
    snsNeurons?: Record<string, SnsGovernanceDid.Neuron[]>;
    parameters?: SnsParametersStore;
  }) =>
    getHotkeys({
      nnsNeurons,
      snsNeurons: Object.fromEntries(
        Object.entries(snsNeurons).map(([universeId, neurons]) => [
          universeId,
          { neurons, certified: true },
        ])
      ),
      snsParameters: parameters,
      universes,
      identity: mockIdentity,
    });

  it("should return an empty list without neurons", () => {
    expect(getAllHotkeys({})).toEqual([]);
  });

  it("should group the hotkeys of NNS and SNS neurons by principal", () => {
    expect(
      getAllHotkeys({
        nnsNeurons: [
          nnsNeuron({ neuronId: 1n, hotKeys: [hotkeyA] }),
          nnsNeuron({ neuronId: 2n, hotKeys: [hotkeyA, hotkeyB] }),
        ],
        snsNeurons: {
          [sns2Universe.canisterId]: [
            snsNeuron({ id: 1, hotkeys: [hotkeyA] }),
            snsNeuron({ id: 2, hotkeys: [hotkeyA] }),
          ],
        },
      })
    ).toEqual([
      {
        principal: hotkeyA.toText(),
        neuronCount: 4,
        projects: [
          {
            universe: nnsUniverse,
            neurons: [
              { neuronId: "1", canChange: true },
              { neuronId: "2", canChange: true },
            ],
          },
          {
            universe: sns2Universe,
            neurons: [
              { neuronId: snsNeuronId(1), canChange: true },
              { neuronId: snsNeuronId(2), canChange: true },
            ],
          },
        ],
      },
      {
        principal: hotkeyB.toText(),
        neuronCount: 1,
        projects: [
          {
            universe: nnsUniverse,
            neurons: [{ neuronId: "2", canChange: true }],
          },
        ],
      },
    ]);
  });

  it("should not list the principal of the user", () => {
    expect(
      getAllHotkeys({
        nnsNeurons: [
          nnsNeuron({ neuronId: 1n, hotKeys: [userPrincipal, hotkeyA] }),
        ],
      }).map(({ principal }) => principal)
    ).toEqual([hotkeyA.toText()]);
  });

  it("should not list SNS principals that are not hotkeys", () => {
    expect(
      getAllHotkeys({
        snsNeurons: {
          [sns1Universe.canisterId]: [
            snsNeuron({
              id: 1,
              otherPermissions: [
                {
                  principal: hotkeyA,
                  permissions: [
                    SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
                  ],
                },
              ],
            }),
          ],
        },
      })
    ).toEqual([]);
  });

  it("should ignore the neurons of unknown universes", () => {
    expect(
      getAllHotkeys({
        snsNeurons: {
          [principal(99).toText()]: [snsNeuron({ id: 1, hotkeys: [hotkeyA] })],
        },
      })
    ).toEqual([]);
  });

  it("should list the projects in the order of the universes", () => {
    const [hotkey] = getAllHotkeys({
      nnsNeurons: [nnsNeuron({ neuronId: 1n, hotKeys: [hotkeyA] })],
      snsNeurons: {
        [sns2Universe.canisterId]: [snsNeuron({ id: 1, hotkeys: [hotkeyA] })],
        [sns1Universe.canisterId]: [snsNeuron({ id: 1, hotkeys: [hotkeyA] })],
      },
    });

    expect(hotkey.projects.map(({ universe }) => universe.title)).toEqual([
      "Internet Computer",
      "SNS-1",
      "SNS-2",
    ]);
  });

  it("should sort hotkeys with the same neuron count by principal", () => {
    expect(
      getAllHotkeys({
        nnsNeurons: [nnsNeuron({ neuronId: 1n, hotKeys: [hotkeyB, hotkeyA] })],
      }).map(({ principal }) => principal)
    ).toEqual([hotkeyA.toText(), hotkeyB.toText()].sort());
  });

  describe("canChange", () => {
    const getNeurons = (params: Parameters<typeof getAllHotkeys>[0]) =>
      getAllHotkeys(params)[0].projects[0].neurons;

    it("should not change an NNS neuron that another principal controls", () => {
      expect(
        getNeurons({
          nnsNeurons: [
            nnsNeuron({
              neuronId: 1n,
              hotKeys: [hotkeyA],
              controller: principal(50).toText(),
            }),
          ],
        })
      ).toEqual([{ neuronId: "1", canChange: false }]);
    });

    it("should not change an SNS neuron if the user cannot manage its principals", () => {
      expect(
        getNeurons({
          snsNeurons: {
            [sns1Universe.canisterId]: [
              snsNeuron({
                id: 1,
                hotkeys: [hotkeyA],
                userPermissions: HOTKEY_PERMISSIONS,
              }),
            ],
          },
        })
      ).toEqual([{ neuronId: snsNeuronId(1), canChange: false }]);
    });

    it("should not change an SNS neuron if the SNS does not grant hotkey permissions", () => {
      expect(
        getNeurons({
          snsNeurons: {
            [sns1Universe.canisterId]: [
              snsNeuron({ id: 1, hotkeys: [hotkeyA] }),
            ],
          },
          parameters: {
            [sns1Universe.canisterId]: {
              parameters: {
                ...parametersWithHotkeys,
                neuron_grantable_permissions: [
                  {
                    permissions: Int32Array.from([
                      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
                    ]),
                  },
                ],
              },
            },
          },
        })
      ).toEqual([{ neuronId: snsNeuronId(1), canChange: false }]);
    });

    it("should not change an SNS neuron without the parameters of the SNS", () => {
      expect(
        getNeurons({
          snsNeurons: {
            [sns1Universe.canisterId]: [
              snsNeuron({ id: 1, hotkeys: [hotkeyA] }),
            ],
          },
          parameters: {
            [sns1Universe.canisterId]: {
              parameters: {
                ...parametersWithHotkeys,
                neuron_grantable_permissions: [],
              },
            },
          },
        })
      ).toEqual([{ neuronId: snsNeuronId(1), canChange: false }]);
      expect(
        getNeurons({
          snsNeurons: {
            [sns1Universe.canisterId]: [
              snsNeuron({ id: 1, hotkeys: [hotkeyA] }),
            ],
          },
          parameters: {},
        })
      ).toEqual([{ neuronId: snsNeuronId(1), canChange: false }]);
    });
  });
});
