import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { enumValues } from "$lib/utils/enum.utils";
import {
  canIdentityManageHotkeys,
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronByHexId,
  getSnsNeuronHotkeys,
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  getSnsNeuronState,
  hasPermissions,
  hasPermissionToDisburse,
  isSnsNeuron,
  isUserHotkey,
  routePathSnsNeuronId,
  routePathSnsNeuronRootCanisterId,
  sortSnsNeuronsByCreatedTimestamp,
} from "$lib/utils/sns-neuron.utils";
import { bytesToHexString } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "../../mocks/sns-neurons.mock";

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

describe("sns-neuron utils", () => {
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

  describe("routePathSnsNeuronId", () => {
    afterAll(() => jest.clearAllMocks());
    it("should get neuronId from valid path", async () => {
      expect(routePathSnsNeuronId("/u/222/neuron/123")).toBe("123");
      expect(routePathSnsNeuronId("/u/222/neuron/0")).toBe("0");
    });

    it("should not get neuronId from invalid path", async () => {
      expect(routePathSnsNeuronId("/#/neuron/")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/u/123")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/u/124/neuron")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/neurons/")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/accounts/")).toBeUndefined();
    });
  });

  describe("routePathSnsNeuronRootCanisterId", () => {
    afterAll(() => jest.clearAllMocks());
    it("should get root canister id from valid path", async () => {
      expect(routePathSnsNeuronRootCanisterId("/u/222/neuron/123")).toBe("222");
      expect(routePathSnsNeuronRootCanisterId("/u/0ff/neuron/0")).toBe("0ff");
    });

    it("should not get root canister id from invalid path", async () => {
      expect(routePathSnsNeuronRootCanisterId("/#/neuron/")).toBeUndefined();
      expect(routePathSnsNeuronRootCanisterId("/#/u/123")).toBeUndefined();
      expect(
        routePathSnsNeuronRootCanisterId("/#/u/124/neuron")
      ).toBeUndefined();
      expect(routePathSnsNeuronRootCanisterId("/#/neurons/")).toBeUndefined();
      expect(routePathSnsNeuronRootCanisterId("/#/accounts/")).toBeUndefined();
    });
  });

  describe("canIdentityManageHotkeys", () => {
    const addVotePermission = (key) => ({
      principal: [Principal.fromText(key)] as [Principal],
      permission_type: Int32Array.from([
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
      ]),
    });
    const hotkeys = [
      "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe",
      "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae",
    ];

    it("returns true when user has voting rights", () => {
      const controlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [...hotkeys, mockIdentity.getPrincipal().toText()].map(
          addVotePermission
        ),
      };
      expect(
        canIdentityManageHotkeys({
          neuron: controlledNeuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when user has no voting rights", () => {
      const unControlledNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: hotkeys.map(addVotePermission),
      };
      expect(
        canIdentityManageHotkeys({
          neuron: unControlledNeuron,
          identity: mockIdentity,
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
        })
      ).toBe(false);
    });
  });

  describe("getSnsNeuronHotkeys", () => {
    const addVoteProposalPermission = (key) => ({
      principal: [Principal.fromText(key)] as [Principal],
      permission_type: Int32Array.from([
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
      ]),
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
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
            ]),
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
    it("returns true if user only has voting and proposal permissions but not all permissions", () => {
      const hotkeyneuron: SnsNeuron = {
        ...mockSnsNeuron,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
            ]),
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
    it("returns true if user has voting and proposal permissions but not all permissions", () => {
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
      ).toBe(true);
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
  });

  describe("isSnsNeuron", () => {
    it("returns true for snsNeuron", () => {
      const neuron: SnsNeuron = { ...mockSnsNeuron };
      expect(isSnsNeuron(neuron)).toBeTruthy();
    });

    it("returns false for NeuronInfo (nnsNeuron)", () => {
      const neuron: NeuronInfo = { ...mockNeuron };
      expect(isSnsNeuron(neuron)).toBeFalsy();
    });
  });
});
