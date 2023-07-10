import {
  SECONDS_IN_DAY,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import {
  HOTKEY_PERMISSIONS,
  MANAGE_HOTKEY_PERMISSIONS,
  MAX_NEURONS_SUBACCOUNTS,
} from "$lib/constants/sns-neurons.constants";
import { NextMemoNotFoundError } from "$lib/types/sns-neurons.errors";
import { enumValues } from "$lib/utils/enum.utils";
import {
  ageMultiplier,
  canIdentityManageHotkeys,
  dissolveDelayMultiplier,
  followeesByFunction,
  followeesByNeuronId,
  formattedMaturity,
  formattedStakedMaturity,
  formattedTotalMaturity,
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronByHexId,
  getSnsNeuronHotkeys,
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  getSnsNeuronState,
  getSnsNeuronVote,
  hasEnoughMaturityToStake,
  hasEnoughStakeToSplit,
  hasPermissionToDisburse,
  hasPermissionToDissolve,
  hasPermissionToSplit,
  hasPermissionToStakeMaturity,
  hasPermissionToVote,
  hasPermissions,
  hasStakedMaturity,
  hasValidStake,
  ineligibleSnsNeurons,
  isCommunityFund,
  isEnoughAmountToSplit,
  isSnsNeuron,
  isUserHotkey,
  isVesting,
  minNeuronSplittable,
  needsRefresh,
  neuronAge,
  nextMemo,
  snsNeuronVotingPower,
  snsNeuronsIneligibilityReasons,
  snsNeuronsToIneligibleNeuronData,
  sortSnsNeuronsByCreatedTimestamp,
  subaccountToHexString,
  vestingInSeconds,
  votableSnsNeurons,
  votedSnsNeuronDetails,
  votedSnsNeurons,
  type SnsFolloweesByNeuron,
} from "$lib/utils/sns-neuron.utils";
import { bytesToHexString } from "$lib/utils/utils";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { Identity } from "@dfinity/agent";
import { NeuronState, Vote, type NeuronInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemParameters } from "@dfinity/sns";
import {
  SnsNeuronPermissionType,
  SnsVote,
  neuronSubaccount,
  type SnsNervousSystemFunction,
  type SnsNeuron,
  type SnsProposalData,
} from "@dfinity/sns";
import type { NeuronPermission } from "@dfinity/sns/dist/candid/sns_governance";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { vi } from "vitest";

vi.mock("$lib/constants/sns-neurons.constants.ts", async () => ({
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ...(await vi.importActual<any>("$lib/constants/sns-neurons.constants.ts")),
  MAX_NEURONS_SUBACCOUNTS: 10,
}));

const appendPermissions = ({
  neuron,
  identity,
  permissions,
}: {
  neuron: SnsNeuron;
  identity: Identity;
  permissions: SnsNeuronPermissionType[];
}) =>
  (neuron.permissions = [
    ...neuron.permissions,
    {
      principal: [identity.getPrincipal()],
      permission_type: Int32Array.from(permissions),
    },
  ]);

const permissionsWithTypeVote = [
  {
    principal: [mockIdentity.getPrincipal()],
    permission_type: Int32Array.from([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
    ]),
  } as NeuronPermission,
];
const testSnsNeuronA: SnsNeuron = {
  ...mockSnsNeuron,
  id: [
    {
      id: arrayOfNumberToUint8Array([1, 2, 3]),
    },
  ],
  permissions: permissionsWithTypeVote,
};
const testSnsNeuronB: SnsNeuron = {
  ...mockSnsNeuron,
  id: [
    {
      id: arrayOfNumberToUint8Array([3, 2, 1]),
    },
  ],
  permissions: permissionsWithTypeVote,
};
const testVotedNeuronA: SnsNeuron = {
  ...mockSnsNeuron,
  id: [
    {
      id: arrayOfNumberToUint8Array([1, 2, 3]),
    },
  ],
  permissions: permissionsWithTypeVote,
};
const testVotedNeuronB: SnsNeuron = {
  ...mockSnsNeuron,
  id: [
    {
      id: arrayOfNumberToUint8Array([1, 1, 1]),
    },
  ],
  permissions: permissionsWithTypeVote,
};
const testNotVotedNeuron: SnsNeuron = {
  ...mockSnsNeuron,
  id: [
    {
      id: arrayOfNumberToUint8Array([3, 2, 1]),
    },
  ],
  permissions: permissionsWithTypeVote,
};

describe("sns-neuron utils", () => {
  const now = 1686806749421;
  const nowSeconds = Math.floor(now / 1000);
  const yesterday = BigInt(nowSeconds - SECONDS_IN_DAY);
  const monthAgo = BigInt(nowSeconds - SECONDS_IN_MONTH);
  const oneWeek = BigInt(SECONDS_IN_DAY * 7);

  describe("sortNeuronsByCreatedTimestamp", () => {
    it("should sort neurons by created_timestamp_seconds", () => {
      const neuron1 = {
        ...mockSnsNeuron,
        created_timestamp_seconds: BigInt(1),
      };
      const neuron2 = {
        ...mockSnsNeuron,
        created_timestamp_seconds: BigInt(2),
      };
      const neuron3 = {
        ...mockSnsNeuron,
        created_timestamp_seconds: BigInt(3),
      };
      expect(sortSnsNeuronsByCreatedTimestamp([])).toEqual([]);
      expect(sortSnsNeuronsByCreatedTimestamp([neuron1])).toEqual([neuron1]);
      expect(
        sortSnsNeuronsByCreatedTimestamp([neuron3, neuron2, neuron1])
      ).toEqual([neuron3, neuron2, neuron1]);
      expect(
        sortSnsNeuronsByCreatedTimestamp([neuron2, neuron1, neuron3])
      ).toEqual([neuron3, neuron2, neuron1]);
    });
  });

  describe("getSnsNeuronState", () => {
    it("returns LOCKED", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.Locked,
      });
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.Locked);
    });

    it("returns DISSOLVING", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.Dissolving,
      });
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.Dissolving);
    });

    it("returns DISSOLVED", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: undefined,
      });
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.Dissolved);
    });

    it("returns DISSOLVED if dissolve in the past", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.Dissolving,
      });
      const dissolveState = neuron.dissolve_state[0];
      if ("WhenDissolvedTimestampSeconds" in dissolveState) {
        dissolveState.WhenDissolvedTimestampSeconds = BigInt(
          Math.floor(Date.now() / 1000 - 3600)
        );
      }
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.Dissolved);
    });

    it("returns DISSOLVED when DissolveDelaySeconds=0", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: undefined,
      });
      neuron.dissolve_state = [
        {
          DissolveDelaySeconds: BigInt(0),
        },
      ];
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.Dissolved);
    });
  });

  describe("getSnsDissolvingTimeInSeconds", () => {
    it("returns undefined if not dissolving", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.Locked,
      });
      expect(getSnsDissolvingTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns time in seconds until dissolve", () => {
      const todayInSeconds = BigInt(Math.round(Date.now() / 1000));
      const delayInSeconds = todayInSeconds + BigInt(SECONDS_IN_YEAR);
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        dissolve_state: [{ WhenDissolvedTimestampSeconds: delayInSeconds }],
      };
      expect(getSnsDissolvingTimeInSeconds(neuron)).toBe(
        BigInt(SECONDS_IN_YEAR)
      );
    });
  });

  describe("getSnsLockedTimeInSeconds", () => {
    it("returns undefined if not locked", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.Dissolving,
      });
      expect(getSnsLockedTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns time in seconds until dissolve", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        dissolve_state: [{ DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR) }],
      };
      expect(getSnsLockedTimeInSeconds(neuron)).toBe(BigInt(SECONDS_IN_YEAR));
    });
  });

  describe("getSnsNeuronStake", () => {
    it("returns stake minus neuron fees", () => {
      const stake1 = BigInt(100);
      const stake2 = BigInt(200);
      const fees1 = BigInt(10);
      const fees2 = BigInt(0);
      const neuron1: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: stake1,
        neuron_fees_e8s: fees1,
      };
      const neuron2: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: stake2,
        neuron_fees_e8s: fees2,
      };
      expect(getSnsNeuronStake(neuron1)).toBe(stake1 - fees1);
      expect(getSnsNeuronStake(neuron2)).toBe(stake2 - fees2);
    });
  });

  describe("getSnsNeuronIdAsHexString", () => {
    it("returns id numbers concatenated", () => {
      const id = [
        154, 174, 251, 49, 236, 17, 214, 189, 195, 140, 58, 89, 61, 29, 138,
        113, 79, 48, 136, 37, 96, 61, 215, 50, 182, 65, 198, 97, 8, 19, 238, 36,
      ];
      const neuron: SnsNeuron = createMockSnsNeuron({
        id,
      });
      expect(getSnsNeuronIdAsHexString(neuron)).toBe(
        "9aaefb31ec11d6bdc38c3a593d1d8a714f308825603dd732b641c6610813ee24"
      );
    });
  });

  describe("subaccountToHexString", () => {
    it("returns id numbers concatenated", () => {
      const subaccount = arrayOfNumberToUint8Array([
        154, 174, 251, 49, 236, 17, 214, 189, 195, 140, 58, 89, 61, 29, 138,
        113, 79, 48, 136, 37, 96, 61, 215, 50, 182, 65, 198, 97, 8, 19, 238, 36,
      ]);
      expect(subaccountToHexString(subaccount)).toBe(
        "9aaefb31ec11d6bdc38c3a593d1d8a714f308825603dd732b641c6610813ee24"
      );
    });
  });

  describe("nextMemo", () => {
    it("returns next memo", () => {
      const ids = [
        neuronSubaccount({
          controller: mockIdentity.getPrincipal(),
          index: 0,
        }),
        neuronSubaccount({
          controller: mockIdentity.getPrincipal(),
          index: 1,
        }),
      ];
      const neurons = ids.map(
        (id) => ({ ...mockSnsNeuron, id: [{ id }] } as SnsNeuron)
      );
      const memo = nextMemo({
        neurons,
        identity: mockIdentity,
      });
      expect(memo).toBe(2n);
    });

    it("returns 0 if no neurons", () => {
      const memo = nextMemo({
        neurons: [],
        identity: mockIdentity,
      });
      expect(memo).toBe(0n);
    });

    it("throws NextMemoNotFoundError", () => {
      const ids = Array.from(Array(MAX_NEURONS_SUBACCOUNTS + 1)).map(
        (_, index) =>
          neuronSubaccount({
            controller: mockIdentity.getPrincipal(),
            index,
          })
      );
      const neurons = ids.map(
        (id) => ({ ...mockSnsNeuron, id: [{ id }] } as SnsNeuron)
      );

      expect(() =>
        nextMemo({
          neurons,
          identity: mockIdentity,
        })
      ).toThrowError(NextMemoNotFoundError);
    });
  });

  describe("getSnsNeuronByHexId", () => {
    it("returns the neuron with the matching id", () => {
      const neuronId = [1, 2, 3, 4];
      const neuron1 = createMockSnsNeuron({
        id: neuronId,
      });
      const neuron2 = createMockSnsNeuron({
        id: [5, 6, 7, 8],
      });
      const neurons = [neuron1, neuron2];
      expect(
        getSnsNeuronByHexId({
          neurons,
          neuronIdHex: bytesToHexString(neuronId),
        })
      ).toBe(neuron1);
    });

    it("returns undefined when no matching id", () => {
      const neuron1 = createMockSnsNeuron({
        id: [1, 2, 3, 4],
      });
      const neuron2 = createMockSnsNeuron({
        id: [5, 6, 7, 8],
      });
      const neurons = [neuron1, neuron2];
      expect(
        getSnsNeuronByHexId({
          neurons,
          neuronIdHex: bytesToHexString([1, 1, 1, 1]),
        })
      ).toBeUndefined();
    });

    it("returns undefined when no neurons", () => {
      expect(
        getSnsNeuronByHexId({
          neurons: [],
          neuronIdHex: bytesToHexString([1, 1, 1, 1]),
        })
      ).toBeUndefined();
      expect(
        getSnsNeuronByHexId({
          neurons: undefined,
          neuronIdHex: bytesToHexString([1, 1, 1, 1]),
        })
      ).toBeUndefined();
    });
  });

  describe("canIdentityManageHotkeys", () => {
    const hotkeyPermission =
      (permissions: SnsNeuronPermissionType[]) => (key: string) => ({
        principal: [Principal.fromText(key)] as [Principal],
        permission_type: Int32Array.from(permissions),
      });
    const hotkeys = [
      "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe",
      "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae",
    ];

    it("returns true when user has voting and submit proposal rights", () => {
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [...hotkeys, mockIdentity.getPrincipal().toText()].map(
          hotkeyPermission(MANAGE_HOTKEY_PERMISSIONS)
        ),
      };
      expect(
        canIdentityManageHotkeys({
          neuron: controlledNeuron,
          identity: mockIdentity,
          parameters: {
            ...snsNervousSystemParametersMock,
            neuron_grantable_permissions: [
              { permissions: Int32Array.from([...HOTKEY_PERMISSIONS]) },
            ],
          },
        })
      ).toBe(true);
    });

    it("returns false when user has no hotkey permissions", () => {
      const unControlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: hotkeys.map(hotkeyPermission(HOTKEY_PERMISSIONS)),
      };
      expect(
        canIdentityManageHotkeys({
          neuron: unControlledNeuron,
          identity: mockIdentity,
          parameters: snsNervousSystemParametersMock,
        })
      ).toBe(false);
      const otherPermissionNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()] as [Principal],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
            ]),
          },
        ],
      };
      expect(
        canIdentityManageHotkeys({
          neuron: otherPermissionNeuron,
          identity: mockIdentity,
          parameters: snsNervousSystemParametersMock,
        })
      ).toBe(false);
    });

    it("returns false when user has only voting but no submit proposal rights", () => {
      const unControlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockPrincipal] as [Principal],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
            ]),
          },
        ],
      };
      expect(
        canIdentityManageHotkeys({
          neuron: unControlledNeuron,
          identity: mockIdentity,
          parameters: snsNervousSystemParametersMock,
        })
      ).toBe(false);
    });
  });

  describe("getSnsNeuronHotkeys", () => {
    const addVoteProposalPermission = (key) => ({
      principal: [Principal.fromText(key)] as [Principal],
      permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
    });
    const hotkeys = [
      "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe",
      "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae",
    ];
    const allPermissions = Int32Array.from(enumValues(SnsNeuronPermissionType));
    const controllerPermission = {
      principal: [mockPrincipal] as [Principal],
      permission_type: allPermissions,
    };

    it("returns array of principal ids", () => {
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: hotkeys
          .map(addVoteProposalPermission)
          .concat(controllerPermission),
      };
      expect(getSnsNeuronHotkeys(controlledNeuron)).toEqual(hotkeys);
    });

    it("doesn't return the controller", () => {
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: hotkeys
          .map(addVoteProposalPermission)
          .concat(controllerPermission),
      };
      const expectedHotkeys = getSnsNeuronHotkeys(controlledNeuron);
      expect(
        expectedHotkeys.includes(mockIdentity.getPrincipal().toText())
      ).toBe(false);
    });

    it("doesn't return if only voting permission", () => {
      const nonHotkey =
        "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe";
      const hotkey =
        "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae";
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [Principal.fromText(nonHotkey)] as [Principal],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
            ]),
          },
          {
            principal: [Principal.fromText(hotkey)] as [Principal],
            permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
          },
          controllerPermission,
        ],
      };
      const expectedHotkeys = getSnsNeuronHotkeys(controlledNeuron);
      expect(expectedHotkeys.includes(nonHotkey)).toBe(false);
      expect(expectedHotkeys.includes(hotkey)).toBe(true);
    });

    it("returns if only voting permission and voting management permissions", () => {
      const nonHotkey =
        "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe";
      const hotkey =
        "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae";
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [Principal.fromText(nonHotkey)] as [Principal],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
            ]),
          },
          {
            principal: [Principal.fromText(hotkey)] as [Principal],
            permission_type: Int32Array.from([...HOTKEY_PERMISSIONS]),
          },
          {
            principal: [Principal.fromText(hotkey)] as [Principal],
            permission_type: Int32Array.from([
              ...HOTKEY_PERMISSIONS,
              ...MANAGE_HOTKEY_PERMISSIONS,
            ]),
          },
          {
            principal: [Principal.fromText(hotkey)] as [Principal],
            permission_type: Int32Array.from([
              ...HOTKEY_PERMISSIONS,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
            ]),
          },
          {
            principal: [Principal.fromText(hotkey)] as [Principal],
            permission_type: Int32Array.from([
              ...HOTKEY_PERMISSIONS,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS,
            ]),
          },
          controllerPermission,
        ],
      };
      const expectedHotkeys = getSnsNeuronHotkeys(controlledNeuron);
      expect(expectedHotkeys.includes(nonHotkey)).toBe(false);
      expect(expectedHotkeys.filter((h) => h === hotkey).length).toBe(2);
    });

    it("doesn't return if more than hotkeys permissions", () => {
      const nonHotkey =
        "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe";
      const hotkey =
        "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae";
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [Principal.fromText(nonHotkey)] as [Principal],
            permission_type: Int32Array.from([
              ...Int32Array.from(HOTKEY_PERMISSIONS),
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
            ]),
          },
          {
            principal: [Principal.fromText(hotkey)] as [Principal],
            permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
          },
          controllerPermission,
        ],
      };
      const expectedHotkeys = getSnsNeuronHotkeys(controlledNeuron);
      expect(expectedHotkeys.includes(nonHotkey)).toBe(false);
      expect(expectedHotkeys.includes(hotkey)).toBe(true);
    });
  });

  describe("isUserHotkey", () => {
    it("returns true if user onl has voting and proposal permissions but not all permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
          },
        ],
      };
      expect(
        isUserHotkey({
          neuron: hotkeyneuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });
    it("returns false if user has voting and proposal permissions but not all permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
            ]),
          },
        ],
      };
      expect(
        isUserHotkey({
          neuron: hotkeyneuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });

    it("returns false if user has all the permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(
              enumValues(SnsNeuronPermissionType)
            ),
          },
        ],
      };
      expect(
        isUserHotkey({
          neuron: hotkeyneuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
    it("returns false if user has voting but not proposal permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
            ]),
          },
        ],
      };
      expect(
        isUserHotkey({
          neuron: hotkeyneuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });

    it("returns false if user is not in the permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [Principal.fromText("aaaaa-aa")],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
            ]),
          },
        ],
      };
      expect(
        isUserHotkey({
          neuron: hotkeyneuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
    it("returns false if user is has empty permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([]),
          },
        ],
      };
      expect(
        isUserHotkey({
          neuron: hotkeyneuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("hasPermissionToDisburse", () => {
    it("returns true when user has disburse rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
        ],
      });

      expect(
        hasPermissionToDisburse({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when user has no disburse rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
        ],
      });

      expect(
        hasPermissionToDisburse({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("hasPermissionToDissolve", () => {
    it("returns true when user has disburse rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
        ],
      });

      expect(
        hasPermissionToDissolve({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when user has no disburse rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
        ],
      });

      expect(
        hasPermissionToDissolve({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("hasPermissionToSplit", () => {
    it("returns true when user has split rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT],
      });

      expect(
        hasPermissionToSplit({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when user has no split rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
        ],
      });

      expect(
        hasPermissionToSplit({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("hasPermissionToVote", () => {
    it("returns true when user has voting rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
      });

      expect(
        hasPermissionToVote({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when user has no voting rights", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        ],
      });

      expect(
        hasPermissionToVote({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("hasPermissionToStakeMaturity", () => {
    it("returns true when user has stake maturity permissions", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY,
        ],
      });

      expect(
        hasPermissionToStakeMaturity({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when user has no staking maturity permissions", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        ],
      });

      expect(
        hasPermissionToStakeMaturity({
          neuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("hasPermissions", () => {
    it("returns true when user has one selected permission", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      const permissions = [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE];
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions,
      });

      expect(
        hasPermissions({
          neuron,
          identity: mockIdentity,
          permissions,
        })
      ).toBe(true);
    });

    it("returns false when user doesn't have selected permission", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      const permissions = [];
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions,
      });

      expect(
        hasPermissions({
          neuron,
          identity: mockIdentity,
          permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
        })
      ).toBe(false);
    });

    it("returns false when user doesn't have selected permission for selected identity", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      const permissions = [];
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions,
      });

      expect(
        hasPermissions({
          neuron,
          identity: {
            ...mockIdentity,
            getPrincipal: () =>
              Principal.fromText(
                "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe"
              ),
          },
          permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
        })
      ).toBe(false);
    });

    it("returns true when user has multiple selected permission", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      const permissions = [
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MERGE_MATURITY,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
      ];
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [
          ...permissions,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT,
        ],
      });

      expect(
        hasPermissions({
          neuron,
          identity: mockIdentity,
          permissions,
        })
      ).toBe(true);
    });

    it("returns true when user has multiple selected permission", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron, permissions: [] };
      const permissions = [
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MERGE_MATURITY,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT,
      ];
      appendPermissions({
        neuron,
        identity: mockIdentity,
        permissions: [...permissions],
      });

      expect(
        hasPermissions({
          neuron,
          identity: mockIdentity,
          permissions: [
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_UNSPECIFIED,
          ],
          options: { anyPermission: true },
        })
      ).toBe(false);

      expect(
        hasPermissions({
          neuron,
          identity: mockIdentity,
          permissions: [
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
          ],
          options: { anyPermission: true },
        })
      ).toBe(true);
    });
  });

  describe("isSnsNeuron", () => {
    it("returns true for snsNeuron", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron };
      expect(isSnsNeuron(neuron)).toBeTruthy();
    });

    it("returns false for NeuronInfo (nnsNeuron)", () => {
      const neuron: NeuronInfo = { ...mockNeuron };
      expect(isSnsNeuron(neuron)).toBe(false);
    });
  });

  describe("hasValidStake", () => {
    it("returns true if neuron has stake greater than 0", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: BigInt(10_000_000),
        maturity_e8s_equivalent: BigInt(0),
      };
      expect(hasValidStake(neuron)).toBeTruthy();
    });

    it("returns true if neuron has maturity greater than 0", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: BigInt(0),
        maturity_e8s_equivalent: BigInt(10_000_000),
      };
      expect(hasValidStake(neuron)).toBeTruthy();
    });

    it("returns true if neuron has maturity and stake greater than 0", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: BigInt(10_000_000),
        maturity_e8s_equivalent: BigInt(10_000_000),
      };
      expect(hasValidStake(neuron)).toBeTruthy();
    });

    it("returns false if neuron has no maturity and no stake", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: BigInt(0),
        maturity_e8s_equivalent: BigInt(0),
      };
      expect(hasValidStake(neuron)).toBe(false);
    });
  });

  describe("minNeuronSplittable", () => {
    it("returns minimum amount to be splittable", () => {
      expect(
        minNeuronSplittable({
          fee: 100n,
          neuronMinimumStake: 1000n,
        })
      ).toBe(2100n);
    });
  });

  describe("isEnoughAmountToSplit", () => {
    it("returns true if enough", () => {
      expect(
        isEnoughAmountToSplit({
          amount: 1100n,
          fee: 100n,
          neuronMinimumStake: 1000n,
        })
      ).toBeTruthy();
    });

    it("returns false if not enough", () => {
      expect(
        isEnoughAmountToSplit({
          amount: 1099n,
          fee: 100n,
          neuronMinimumStake: 1000n,
        })
      ).toBe(false);
    });
  });

  describe("hasEnoughStakeToSplit", () => {
    it("returns true if enough", () => {
      expect(
        hasEnoughStakeToSplit({
          neuron: {
            ...mockSnsNeuron,
            cached_neuron_stake_e8s: 2100n,
            neuron_fees_e8s: 0n,
          },
          fee: 100n,
          neuronMinimumStake: 1000n,
        })
      ).toBeTruthy();
    });

    it("returns false if not enough", () => {
      expect(
        hasEnoughStakeToSplit({
          neuron: {
            ...mockSnsNeuron,
            cached_neuron_stake_e8s: 2099n,
            neuron_fees_e8s: 0n,
          },
          fee: 100n,
          neuronMinimumStake: 1000n,
        })
      ).toBe(false);
    });
  });

  describe("formattedMaturity", () => {
    it("returns maturity with two decimals", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(200000000),
      };
      expect(formattedMaturity(neuron)).toBe("2.00");
    });

    it("returns 0 when maturity is 0", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(0),
        staked_maturity_e8s_equivalent: [] as [] | [bigint],
      };
      expect(formattedMaturity(neuron)).toBe("0");
    });

    it("returns 0 when no neuron provided", () => {
      expect(formattedMaturity(null)).toBe("0");
      expect(formattedMaturity(undefined)).toBe("0");
    });
  });

  describe("formattedTotalMaturity", () => {
    it("returns maturity with two decimals", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(200000000),
        staked_maturity_e8s_equivalent: [] as [] | [bigint],
      };
      expect(formattedTotalMaturity(neuron)).toBe("2.00");
    });

    it("returns total if maturity only is provided", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(200000000),
        staked_maturity_e8s_equivalent: [] as [] | [bigint],
      };
      expect(formattedTotalMaturity(neuron)).toBe("2.00");
    });

    it("returns sum if staked maturity is provided", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(200000000),
        staked_maturity_e8s_equivalent: [BigInt(200000000)] as [] | [bigint],
      };
      expect(formattedTotalMaturity(neuron)).toBe("4.00");
    });

    it("returns 0 when maturity is 0", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(0),
        staked_maturity_e8s_equivalent: [] as [] | [bigint],
      };
      expect(formattedTotalMaturity(neuron)).toBe("0");
    });

    it("returns 0 when no neuron provided", () => {
      expect(formattedTotalMaturity(null)).toBe("0");
      expect(formattedTotalMaturity(undefined)).toBe("0");
    });
  });

  describe("hasEnoughMaturityToStake", () => {
    it("should return true if staked maturity", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(200000000),
      };
      expect(hasEnoughMaturityToStake(neuron)).toBeTruthy();
    });

    it("should return false if no staked maturity", () => {
      const neuron = {
        ...mockSnsNeuron,
        maturity_e8s_equivalent: BigInt(0),
      };

      expect(hasEnoughMaturityToStake(neuron)).toBe(false);
    });

    it("should return false when no neuron provided", () => {
      expect(hasEnoughMaturityToStake(null)).toBe(false);
      expect(hasEnoughMaturityToStake(undefined)).toBe(false);
    });
  });

  describe("hasStakedMaturity", () => {
    it("should return true if has staked maturity", () => {
      const neuron = {
        ...mockSnsNeuron,
        staked_maturity_e8s_equivalent: [BigInt(200000000)] as [] | [bigint],
      };
      expect(hasStakedMaturity(neuron)).toBeTruthy();
    });

    it("should return also true if staked maturity is zero", () => {
      const neuron = {
        ...mockSnsNeuron,
        staked_maturity_e8s_equivalent: [BigInt(0)] as [] | [bigint],
      };
      expect(hasStakedMaturity(neuron)).toBeTruthy();
    });

    it("should return false if no staked maturity", () => {
      const neuron = {
        ...mockSnsNeuron,
        staked_maturity_e8s_equivalent: [] as [] | [bigint],
      };
      expect(hasStakedMaturity(neuron)).toBe(false);
    });

    it("should return false when no neuron provided", () => {
      expect(hasStakedMaturity(null)).toBe(false);
      expect(hasStakedMaturity(undefined)).toBe(false);
    });
  });

  describe("formattedStakedMaturity", () => {
    it("returns staked maturity with two decimals", () => {
      const neuron = {
        ...mockSnsNeuron,
        staked_maturity_e8s_equivalent: [BigInt(2)] as [] | [bigint],
      };
      expect(formattedStakedMaturity(neuron)).toBe("0.00000002");
    });

    it("returns 0 when staked maturity is 0", () => {
      const neuron = {
        ...mockSnsNeuron,
        staked_maturity_e8s_equivalent: [BigInt(0)] as [] | [bigint],
      };
      expect(formattedStakedMaturity(neuron)).toBe("0");
    });

    it("returns 0 when no neuron provided", () => {
      expect(formattedStakedMaturity(null)).toBe("0");
      expect(formattedStakedMaturity(undefined)).toBe("0");
    });
  });

  describe("isCommunityFund", () => {
    it("returns true if the neurons is from the community fund", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        source_nns_neuron_id: [BigInt(2)],
        staked_maturity_e8s_equivalent: [] as [] | [bigint],
      };
      expect(isCommunityFund(neuron)).toBeTruthy();
    });
    it("returns true if the neurons is from the community fund", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        source_nns_neuron_id: [],
      };
      expect(isCommunityFund(neuron)).toBe(false);
    });
  });

  describe("needsRefresh", () => {
    it("returns true when neuron stake does not match the balance", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: BigInt(2),
      };
      expect(
        needsRefresh({
          neuron,
          balanceE8s: BigInt(1),
        })
      ).toBeTruthy();
    });
    it("returns false when the neuron stake matches the balance", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: BigInt(2),
      };
      expect(
        needsRefresh({
          neuron,
          balanceE8s: BigInt(2),
        })
      ).toBe(false);
    });
  });

  describe("followeesByNeuronId", () => {
    const function0: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(0),
    };
    const function1: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(1),
    };
    const function2: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(2),
    };
    const nsFunctions = [function0, function1, function2];
    const neuron1 = createMockSnsNeuron({
      id: [1, 2, 3, 4],
    });
    const neuron2 = createMockSnsNeuron({
      id: [5, 6, 7, 8],
    });
    it("returns empty array if no followees", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [],
      };
      expect(followeesByNeuronId({ neuron, nsFunctions })).toEqual([]);
    });

    it("returns empty array if no nsFunctions", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[function0.id, { followees: [neuron1.id[0]] }]],
      };
      expect(followeesByNeuronId({ neuron, nsFunctions: [] })).toEqual([]);
    });

    it("returns multiple followees with multiple topics each", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [
          [function0.id, { followees: [neuron1.id[0]] }],
          [function1.id, { followees: [neuron2.id[0]] }],
          [function2.id, { followees: [neuron1.id[0], neuron2.id[0]] }],
        ],
      };
      const expectedFollowee1: SnsFolloweesByNeuron = {
        neuronIdHex: getSnsNeuronIdAsHexString(neuron1),
        nsFunctions: [function0, function2],
      };
      const expectedFollowee2: SnsFolloweesByNeuron = {
        neuronIdHex: getSnsNeuronIdAsHexString(neuron2),
        nsFunctions: [function1, function2],
      };
      expect(followeesByNeuronId({ neuron, nsFunctions })).toEqual([
        expectedFollowee1,
        expectedFollowee2,
      ]);
    });
  });

  describe("followeesByFunction", () => {
    const function0: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(0),
    };
    const function1: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(1),
    };
    const function2: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(2),
    };
    const neuron1 = createMockSnsNeuron({
      id: [1, 2, 3, 4],
    });
    const neuron2 = createMockSnsNeuron({
      id: [5, 6, 7, 8],
    });
    it("returns empty if no followees", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [],
      };
      expect(followeesByFunction({ neuron, functionId: BigInt(2) })).toEqual(
        []
      );
    });

    it("returns empty if no followees for that function", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[function1.id, { followees: [neuron1.id[0]] }]],
      };
      expect(followeesByFunction({ neuron, functionId: function0.id })).toEqual(
        []
      );
    });

    it("returns followees for the ns function", () => {
      const followees = [neuron1.id[0], neuron2.id[0]];
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [
          [function1.id, { followees }],
          [function2.id, { followees: [neuron1.id[0]] }],
        ],
      };
      expect(followeesByFunction({ neuron, functionId: function1.id })).toEqual(
        followees
      );
    });
  });

  describe("snsNeuronVotingPower", () => {
    const votingPowerNeuron: SnsNeuron = {
      ...mockSnsNeuron,
      staked_maturity_e8s_equivalent: [],
      maturity_e8s_equivalent: BigInt(0),
      neuron_fees_e8s: 0n,
      dissolve_state: [{ DissolveDelaySeconds: 100n }],
      aging_since_timestamp_seconds: 0n,
      voting_power_percentage_multiplier: 100n,
    };

    it("should use the neuron dissolve delay", () => {
      const baseStake = 100n;
      const neuron: SnsNeuron = {
        ...votingPowerNeuron,
        cached_neuron_stake_e8s: baseStake,
      };
      const votingPower = snsNeuronVotingPower({
        neuron,
        snsParameters: {
          max_dissolve_delay_seconds: [100n],
          max_neuron_age_for_age_bonus: [100n],
          max_dissolve_delay_bonus_percentage: [100n],
          max_age_bonus_percentage: [25n],
          neuron_minimum_dissolve_delay_to_vote_seconds: [0n],
        } as unknown as SnsNervousSystemParameters,
      });

      expect(votingPower).toEqual(
        (Number(baseStake) *
          2 * // dissolve_delay boost
          5) /
          4 // voting power boost
      );
    });

    // https://gitlab.com/dfinity-lab/public/ic/-/blob/d621f8f05b8c6302ce0b9a007ed4aeec7e7b2f51/rs/sns/governance/src/neuron.rs#L727
    it("should calculate fully boosted voting power", () => {
      const baseStake = 100n;
      const neuron: SnsNeuron = {
        ...votingPowerNeuron,
        cached_neuron_stake_e8s: baseStake,
      };
      const votingPower = snsNeuronVotingPower({
        neuron,
        newDissolveDelayInSeconds: 100n,
        snsParameters: {
          max_dissolve_delay_seconds: [100n],
          max_neuron_age_for_age_bonus: [100n],
          max_dissolve_delay_bonus_percentage: [100n],
          max_age_bonus_percentage: [25n],
          neuron_minimum_dissolve_delay_to_vote_seconds: [0n],
        } as unknown as SnsNervousSystemParameters,
      });

      expect(votingPower).toEqual(
        (Number(baseStake) *
          2 * // dissolve_delay boost
          5) /
          4 // voting power boost
      );
    });

    // https://gitlab.com/dfinity-lab/public/ic/-/blob/d621f8f05b8c6302ce0b9a007ed4aeec7e7b2f51/rs/sns/governance/src/neuron.rs#L727
    it("should calculate fully boosted voting power with staked maturity", () => {
      const baseStake = 100n;
      const stakedMaturity = 100n;
      const neuron: SnsNeuron = {
        ...votingPowerNeuron,
        staked_maturity_e8s_equivalent: [stakedMaturity],
        cached_neuron_stake_e8s: baseStake,
      };
      const votingPower = snsNeuronVotingPower({
        neuron,
        newDissolveDelayInSeconds: 100n,
        snsParameters: {
          max_dissolve_delay_seconds: [100n],
          max_neuron_age_for_age_bonus: [100n],
          max_dissolve_delay_bonus_percentage: [100n],
          max_age_bonus_percentage: [25n],
          neuron_minimum_dissolve_delay_to_vote_seconds: [0n],
        } as unknown as SnsNervousSystemParameters,
      });

      expect(votingPower).toEqual(
        ((Number(baseStake) + Number(stakedMaturity)) *
          2 * // dissolve_delay boost
          5) /
          4 // voting power boost
      );
    });

    // https://gitlab.com/dfinity-lab/public/ic/-/blob/master/rs/sns/governance/src/neuron.rs#L747
    it("should calculate voting power with bonus thresholds zero", () => {
      const neuron: SnsNeuron = {
        ...votingPowerNeuron,
        cached_neuron_stake_e8s: 100n,
        dissolve_state: [{ DissolveDelaySeconds: 100n }],
        aging_since_timestamp_seconds: 0n,
        voting_power_percentage_multiplier: 100n,
      };
      const votingPower = snsNeuronVotingPower({
        neuron,
        newDissolveDelayInSeconds: 100n,
        snsParameters: {
          max_dissolve_delay_seconds: [0n],
          max_neuron_age_for_age_bonus: [0n],
          max_dissolve_delay_bonus_percentage: [100n],
          max_age_bonus_percentage: [25n],
          neuron_minimum_dissolve_delay_to_vote_seconds: [0n],
        } as unknown as SnsNervousSystemParameters,
      });

      expect(votingPower).toEqual(100);
    });
  });

  describe("dissolveDelayMultiplier", () => {
    const maxDissolveDelay = 400n;
    const dissolveDelayToVote = 200n;
    const snsParameters: SnsNervousSystemParameters = {
      ...snsNervousSystemParametersMock,
      neuron_minimum_dissolve_delay_to_vote_seconds: [dissolveDelayToVote],
      max_dissolve_delay_seconds: [maxDissolveDelay],
      max_dissolve_delay_bonus_percentage: [25n],
    };

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    it("returns 0 if dissolve delay is less than minimum", () => {
      const multiplier = dissolveDelayMultiplier({
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [{ DissolveDelaySeconds: dissolveDelayToVote - 10n }],
        },
        snsParameters,
      });
      expect(multiplier).toEqual(0);
    });

    it("returns 0 if no dissolve delay", () => {
      const multiplier = dissolveDelayMultiplier({
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [],
        },
        snsParameters,
      });
      expect(multiplier).toEqual(0);
    });

    it("takes into account the maximum dissolve delay", () => {
      const multiplier = dissolveDelayMultiplier({
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [{ DissolveDelaySeconds: maxDissolveDelay + 200n }],
        },
        snsParameters: snsParameters,
      });
      expect(multiplier).toEqual(1.25);
    });

    it("returns the dissolve delay multiplier when locked", () => {
      const multiplier = dissolveDelayMultiplier({
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [{ DissolveDelaySeconds: maxDissolveDelay - 200n }],
        },
        snsParameters: snsParameters,
      });
      expect(multiplier).toEqual(1.125);
    });

    it("returns the dissolve delay multiplier when dissolving", () => {
      const multiplier = dissolveDelayMultiplier({
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [
            {
              WhenDissolvedTimestampSeconds:
                BigInt(nowSeconds) + maxDissolveDelay - 200n,
            },
          ],
        },
        snsParameters: snsParameters,
      });
      expect(multiplier).toEqual(1.125);
    });
  });

  describe("ageMultiplier", () => {
    const maxNeuronAge = 400n;
    const snsParameters: SnsNervousSystemParameters = {
      ...snsNervousSystemParametersMock,
      max_neuron_age_for_age_bonus: [maxNeuronAge],
      max_age_bonus_percentage: [25n],
    };

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    // Backend sets the age to a value far in the future if the neuron is dissolving
    // https://github.com/dfinity/ic/blob/f4151f4394f768631edd513d908233de5337fd1c/rs/sns/governance/src/gen/ic_sns_governance.pb.v1.rs#L97C16-L97C16
    it("returns 1 if age is in the future", () => {
      const multiplier = ageMultiplier({
        neuron: {
          ...mockSnsNeuron,
          aging_since_timestamp_seconds: BigInt(nowSeconds) + 100n,
        },
        snsParameters,
      });
      expect(multiplier).toEqual(1);
    });

    it("takes into account the maximum age", () => {
      const multiplier = ageMultiplier({
        neuron: {
          ...mockSnsNeuron,
          aging_since_timestamp_seconds:
            BigInt(nowSeconds) - maxNeuronAge - 200n,
        },
        snsParameters,
      });
      expect(multiplier).toEqual(1.25);
    });

    it("returns the age multiplier", () => {
      const multiplier = ageMultiplier({
        neuron: {
          ...mockSnsNeuron,
          aging_since_timestamp_seconds:
            BigInt(nowSeconds) - maxNeuronAge + 200n,
        },
        snsParameters,
      });
      expect(multiplier).toEqual(1.125);
    });
  });

  describe("snsNeuronsIneligibilityReasons", () => {
    const testProposal: SnsProposalData = {
      ...mockSnsProposal,
      proposal_creation_timestamp_seconds: 50n,
      ballots: [
        [
          "010203",
          {
            vote: SnsVote.Unspecified,
            cast_timestamp_seconds: 0n,
            voting_power: 321n,
          },
        ],
      ],
    };

    it("should return reason 'since' when neuron was created after proposal", () => {
      expect(
        snsNeuronsIneligibilityReasons({
          neuron: {
            ...testSnsNeuronA,
            created_timestamp_seconds: 100n,
          },
          proposal: testProposal,
          identity: mockIdentity,
        })
      ).toEqual("since");
    });

    it("should return reason 'no-permission' when neuron is not allowed to vote", () => {
      expect(
        snsNeuronsIneligibilityReasons({
          neuron: {
            ...testSnsNeuronA,
            created_timestamp_seconds: 50n,
            permissions: [],
          },
          proposal: testProposal,
          identity: mockIdentity,
        })
      ).toEqual("no-permission");
    });

    it("should return reason 'short' when neuron has too short dissolve delay", () => {
      expect(
        snsNeuronsIneligibilityReasons({
          neuron: {
            ...testSnsNeuronA,
            created_timestamp_seconds: 50n,
          },
          proposal: { ...testProposal, ballots: [] },
          identity: mockIdentity,
        })
      ).toEqual("short");
    });
  });

  describe("ineligibleSnsNeurons", () => {
    it("should filter by created since proposal neurons", () => {
      const testNeurons: SnsNeuron[] = [
        {
          ...testSnsNeuronA,
          created_timestamp_seconds: 100n,
        },
        {
          ...testSnsNeuronB,
          created_timestamp_seconds: 50n,
        },
      ];
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 50n,
        ballots: [
          [
            "010203",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
          [
            "030201",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
        ],
      };

      const ineligibleNeurons = ineligibleSnsNeurons({
        neurons: testNeurons,
        proposal: testProposal,
        identity: mockIdentity,
      });
      expect(ineligibleNeurons.length).toEqual(1);
      expect(ineligibleNeurons).toEqual([testNeurons[0]]);
    });

    it("should filter by ballots", () => {
      const testNeurons: SnsNeuron[] = [
        {
          ...testSnsNeuronA,
          id: [
            {
              id: arrayOfNumberToUint8Array([1, 2, 3]),
            },
          ],
          created_timestamp_seconds: 50n,
        },
        {
          ...testSnsNeuronB,
          id: [
            {
              id: arrayOfNumberToUint8Array([3, 2, 1]),
            },
          ],
          created_timestamp_seconds: 50n,
        },
      ];
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 100n,
        ballots: [
          [
            "010203",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
        ],
      };

      const ineligibleNeurons = ineligibleSnsNeurons({
        neurons: testNeurons,
        proposal: testProposal,
        identity: mockIdentity,
      });
      expect(ineligibleNeurons.length).toEqual(1);
      expect(ineligibleNeurons).toEqual([testNeurons[1]]);
    });
  });

  describe("votableSnsNeurons", () => {
    it("should filter out ineligible neurons", () => {
      const testNeurons: SnsNeuron[] = [
        {
          ...testSnsNeuronA,
          // created after
          created_timestamp_seconds: 100n,
        },
        {
          ...testSnsNeuronB,
          created_timestamp_seconds: 50n,
        },
      ];
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 50n,
        ballots: [
          [
            "010203",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
          [
            "030201",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
        ],
      };

      const resultNeurons = votableSnsNeurons({
        neurons: testNeurons,
        proposal: testProposal,
        identity: mockIdentity,
      });
      expect(resultNeurons.length).toEqual(1);
      expect(resultNeurons).toEqual([testNeurons[1]]);
    });

    it("should filter out by voting state", () => {
      const testNeurons: SnsNeuron[] = [
        {
          ...testSnsNeuronA,
          id: [
            {
              id: arrayOfNumberToUint8Array([1, 2, 3]),
            },
          ],
          created_timestamp_seconds: 50n,
        },
        // voted
        {
          ...testSnsNeuronB,
          id: [
            {
              id: arrayOfNumberToUint8Array([3, 2, 1]),
            },
          ],
          created_timestamp_seconds: 50n,
        },
      ];
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 100n,
        ballots: [
          [
            "010203",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
          [
            "030201",
            {
              vote: SnsVote.Yes,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
        ],
      };

      const resultNeurons = votableSnsNeurons({
        neurons: testNeurons,
        proposal: testProposal,
        identity: mockIdentity,
      });
      expect(resultNeurons.length).toEqual(1);
      expect(resultNeurons).toEqual([testNeurons[0]]);
    });

    it("should filter out by permissions", () => {
      const testNeurons: SnsNeuron[] = [
        {
          ...testSnsNeuronA,
          created_timestamp_seconds: 50n,
        },
        {
          ...testSnsNeuronB,
          created_timestamp_seconds: 50n,
          // has no vote permissions
          permissions: [],
        },
      ];
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 100n,
        ballots: [
          [
            "010203",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
          [
            "030201",
            {
              vote: SnsVote.Unspecified,
              cast_timestamp_seconds: 0n,
              voting_power: 321n,
            },
          ],
        ],
      };

      const resultNeurons = votableSnsNeurons({
        neurons: testNeurons,
        proposal: testProposal,
        identity: mockIdentity,
      });
      expect(resultNeurons.length).toEqual(1);
      expect(resultNeurons).toEqual([testNeurons[0]]);
    });
  });

  describe("getSnsNeuronVote", () => {
    const testProposal: SnsProposalData = {
      ...mockSnsProposal,
      proposal_creation_timestamp_seconds: 100n,
      ballots: [
        [
          "010203",
          {
            vote: SnsVote.Yes,
            cast_timestamp_seconds: 0n,
            voting_power: 321n,
          },
        ],
      ],
    };
    const testVotedNeuron: SnsNeuron = {
      ...mockSnsNeuron,
      id: [
        {
          id: arrayOfNumberToUint8Array([1, 2, 3]),
        },
      ],
    };
    const testNotVotedNeuron: SnsNeuron = {
      ...mockSnsNeuron,
      id: [
        {
          id: arrayOfNumberToUint8Array([3, 2, 1]),
        },
      ],
    };

    it("should return an sns neuron vote", () => {
      expect(
        getSnsNeuronVote({
          neuron: testVotedNeuron,
          proposal: testProposal,
        })
      ).toEqual(SnsVote.Yes);
    });

    it("should return undefined when nothing found", () => {
      expect(
        getSnsNeuronVote({
          neuron: testNotVotedNeuron,
          proposal: testProposal,
        })
      ).toEqual(undefined);
    });
  });

  describe("votedSnsNeurons", () => {
    const testProposal: SnsProposalData = {
      ...mockSnsProposal,
      proposal_creation_timestamp_seconds: 100n,
      ballots: [
        [
          "010203",
          {
            vote: SnsVote.Yes,
            cast_timestamp_seconds: 0n,
            voting_power: 321n,
          },
        ],
        [
          "010101",
          {
            vote: SnsVote.Yes,
            cast_timestamp_seconds: 0n,
            voting_power: 321n,
          },
        ],
      ],
    };
    const testNeurons: SnsNeuron[] = [
      {
        ...mockSnsNeuron,
        id: [
          {
            id: arrayOfNumberToUint8Array([1, 2, 3]),
          },
        ],
      },
      {
        ...mockSnsNeuron,
        id: [
          {
            id: arrayOfNumberToUint8Array([1, 1, 1]),
          },
        ],
      },
      // not voted
      {
        ...mockSnsNeuron,
        id: [
          {
            id: arrayOfNumberToUint8Array([3, 2, 1]),
          },
        ],
      },
    ];

    it("should return voted sns neurons", () => {
      expect(
        votedSnsNeurons({
          neurons: testNeurons,
          proposal: testProposal,
        }).length
      ).toEqual(2);

      expect(
        votedSnsNeurons({
          neurons: testNeurons,
          proposal: testProposal,
        })
      ).toEqual(testNeurons.slice(0, 2));
    });
  });

  describe("votedSnsNeuronDetails", () => {
    const testProposal: SnsProposalData = {
      ...mockSnsProposal,
      proposal_creation_timestamp_seconds: 100n,
      ballots: [
        [
          "010203",
          {
            vote: SnsVote.Yes,
            cast_timestamp_seconds: 0n,
            voting_power: 324n,
          },
        ],
        [
          "010101",
          {
            vote: SnsVote.No,
            cast_timestamp_seconds: 0n,
            voting_power: 321n,
          },
        ],
      ],
    };

    it("should return an sns neuron vote with ballot voting power", () => {
      expect(
        votedSnsNeuronDetails({
          neurons: [testVotedNeuronA, testVotedNeuronB, testNotVotedNeuron],
          proposal: testProposal,
        })
      ).toEqual([
        {
          idString: "010203",
          votingPower: 324n,
          vote: Vote.Yes,
        },
        {
          idString: "010101",
          votingPower: 321n,
          vote: Vote.No,
        },
      ]);
    });
  });

  describe("snsNeuronsToIneligibleNeuronData", () => {
    it("should return stringified ids", () => {
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 100n,
      };
      expect(
        snsNeuronsToIneligibleNeuronData({
          neurons: [testVotedNeuronA],
          proposal: testProposal,
          identity: mockIdentity,
        })
      ).toEqual([
        expect.objectContaining({
          neuronIdString: "010203",
        }),
      ]);
    });

    it("should return correct reasons", () => {
      const testProposal: SnsProposalData = {
        ...mockSnsProposal,
        proposal_creation_timestamp_seconds: 100n,
      };
      expect(
        snsNeuronsToIneligibleNeuronData({
          neurons: [
            {
              ...testVotedNeuronA,
              created_timestamp_seconds: 200n,
            },
            {
              ...testVotedNeuronB,
              created_timestamp_seconds: 10n,
            },
          ],
          proposal: testProposal,
          identity: mockIdentity,
        })
      ).toEqual([
        {
          neuronIdString: "010203",
          reason: "since",
        },
        {
          neuronIdString: "010101",
          reason: "short",
        },
      ]);
    });
  });

  describe("neuronAge", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    it("returns 0 if age_since is in the future", () => {
      expect(
        neuronAge({
          ...mockSnsNeuron,
          aging_since_timestamp_seconds: BigInt(nowSeconds + 1000),
        })
      ).toEqual(0n);
    });

    it("returns age if age_since is in the past", () => {
      expect(
        neuronAge({
          ...mockSnsNeuron,
          aging_since_timestamp_seconds: BigInt(nowSeconds - SECONDS_IN_MONTH),
        })
      ).toEqual(BigInt(SECONDS_IN_MONTH));
    });
  });

  describe("isVesting", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    it("returns true if still vesting", () => {
      expect(
        isVesting({
          ...mockSnsNeuron,
          created_timestamp_seconds: yesterday,
          vesting_period_seconds: [BigInt(SECONDS_IN_MONTH)],
        })
      ).toEqual(true);
    });

    it("returns false if no vesting", () => {
      expect(
        isVesting({
          ...mockSnsNeuron,
          created_timestamp_seconds: yesterday,
          vesting_period_seconds: [],
        })
      ).toEqual(false);
    });

    it("returns false if vesting finished", () => {
      expect(
        isVesting({
          ...mockSnsNeuron,
          created_timestamp_seconds: monthAgo,
          vesting_period_seconds: [oneWeek],
        })
      ).toEqual(false);
    });
  });

  describe("vestingInSeconds", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    it("returns remaining vesting if still vesting", () => {
      expect(
        vestingInSeconds({
          ...mockSnsNeuron,
          created_timestamp_seconds: yesterday,
          vesting_period_seconds: [BigInt(SECONDS_IN_MONTH)],
        })
      ).toEqual(2543400n);
    });

    it("returns 0n if no vesting", () => {
      expect(
        vestingInSeconds({
          ...mockSnsNeuron,
          created_timestamp_seconds: yesterday,
          vesting_period_seconds: [],
        })
      ).toEqual(0n);
    });

    it("returns 0n if vesting finished", () => {
      expect(
        vestingInSeconds({
          ...mockSnsNeuron,
          created_timestamp_seconds: monthAgo,
          vesting_period_seconds: [oneWeek],
        })
      ).toEqual(0n);
    });
  });
});
