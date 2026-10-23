import {
  toCachedSnsDto,
  toListTopicsResponseDto,
  toNervousFunctionDto,
  toNervousSystemParametersDto,
  toTokenMetadataDto,
  type ImportedSnsData,
} from "$lib/utils/imported-sns.utils";
import {
  convertDtoToListTopicsResponse,
  convertDtoToSnsSummary,
  convertIcrc1Metadata,
  convertNervousFunction,
  convertNervousSystemParameters,
} from "$lib/utils/sns-aggregator-converters.utils";
import {
  genericNervousSystemFunctionMock,
  nativeNervousSystemFunctionMock,
} from "$tests/mocks/sns-functions.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoMock } from "$tests/mocks/sns-topics.mock";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@icp-sdk/canisters/ledger/icrc";
import {
  SnsSwapLifecycle,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";

describe("imported-sns.utils", () => {
  const genericFunctionWithTarget: SnsGovernanceDid.NervousSystemFunction = {
    id: 2001n,
    name: "Transfer",
    description: ["Transfer tokens from the treasury"],
    function_type: [
      {
        GenericNervousSystemFunction: {
          validator_canister_id: [principal(1)],
          target_canister_id: [principal(2)],
          validator_method_name: ["validate_transfer"],
          target_method_name: ["transfer"],
          topic: [{ TreasuryAssetManagement: null }],
        },
      },
    ],
  };

  // Every field has a value, except the one that the aggregator format drops.
  const fullParameters: SnsGovernanceDid.NervousSystemParameters = {
    default_followees: [
      {
        followees: [
          [1n, { followees: [{ id: new Uint8Array([1, 2, 3]) }] }],
          [2n, { followees: [] }],
        ],
      },
    ],
    max_dissolve_delay_seconds: [31_536_000n],
    max_dissolve_delay_bonus_percentage: [100n],
    max_followees_per_function: [15n],
    automatically_advance_target_version: [],
    neuron_claimer_permissions: [{ permissions: Int32Array.from([0, 1, 2]) }],
    neuron_minimum_stake_e8s: [400_000_000n],
    max_neuron_age_for_age_bonus: [15_768_000n],
    initial_voting_period_seconds: [345_600n],
    neuron_minimum_dissolve_delay_to_vote_seconds: [2_628_000n],
    reject_cost_e8s: [1_000_000_000n],
    max_proposals_to_keep_per_action: [100],
    wait_for_quiet_deadline_increase_seconds: [86_400n],
    max_number_of_neurons: [200_000n],
    transaction_fee_e8s: [100_000n],
    custom_proposal_criticality: [
      { additional_critical_native_action_ids: BigUint64Array.from([5n, 6n]) },
    ],
    max_number_of_proposals_with_ballots: [700n],
    max_age_bonus_percentage: [25n],
    neuron_grantable_permissions: [{ permissions: Int32Array.from([3, 4]) }],
    voting_rewards_parameters: [
      {
        final_reward_rate_basis_points: [250n],
        initial_reward_rate_basis_points: [500n],
        reward_rate_transition_duration_seconds: [31_536_000n],
        round_duration_seconds: [86_400n],
      },
    ],
    maturity_modulation_disabled: [true],
    max_number_of_principals_per_neuron: [5n],
  };

  const emptyParameters: SnsGovernanceDid.NervousSystemParameters = {
    default_followees: [],
    max_dissolve_delay_seconds: [],
    max_dissolve_delay_bonus_percentage: [],
    max_followees_per_function: [],
    automatically_advance_target_version: [],
    neuron_claimer_permissions: [],
    neuron_minimum_stake_e8s: [],
    max_neuron_age_for_age_bonus: [],
    initial_voting_period_seconds: [],
    neuron_minimum_dissolve_delay_to_vote_seconds: [],
    reject_cost_e8s: [],
    max_proposals_to_keep_per_action: [],
    wait_for_quiet_deadline_increase_seconds: [],
    max_number_of_neurons: [],
    transaction_fee_e8s: [],
    custom_proposal_criticality: [],
    max_number_of_proposals_with_ballots: [],
    max_age_bonus_percentage: [],
    neuron_grantable_permissions: [],
    voting_rewards_parameters: [],
    maturity_modulation_disabled: [],
    max_number_of_principals_per_neuron: [],
  };

  const tokenMetadata: IcrcTokenMetadataResponse = [
    [IcrcMetadataResponseEntries.DECIMALS, { Nat: 8n }],
    [IcrcMetadataResponseEntries.NAME, { Text: "Test Token" }],
    [IcrcMetadataResponseEntries.SYMBOL, { Text: "TST" }],
    [IcrcMetadataResponseEntries.FEE, { Nat: 10_000n }],
    [IcrcMetadataResponseEntries.LOGO, { Text: "data:image/png;base64,abc" }],
  ];

  describe("toNervousSystemParametersDto", () => {
    it("should round trip all fields", () => {
      expect(
        convertNervousSystemParameters(
          toNervousSystemParametersDto(fullParameters)
        )
      ).toEqual(fullParameters);
    });

    it("should round trip empty fields", () => {
      expect(
        convertNervousSystemParameters(
          toNervousSystemParametersDto(emptyParameters)
        )
      ).toEqual(emptyParameters);
    });

    it("should round trip the parameters of a launched SNS", () => {
      expect(
        convertNervousSystemParameters(
          toNervousSystemParametersDto(snsNervousSystemParametersMock)
        )
      ).toEqual(snsNervousSystemParametersMock);
    });
  });

  describe("toNervousFunctionDto", () => {
    it.each([
      ["native", nativeNervousSystemFunctionMock],
      ["generic without values", genericNervousSystemFunctionMock],
      ["generic with values", genericFunctionWithTarget],
    ])("should round trip a %s function", (_, nsFunction) => {
      expect(convertNervousFunction(toNervousFunctionDto(nsFunction))).toEqual(
        nsFunction
      );
    });

    it("should round trip a function without description and type", () => {
      const nsFunction: SnsGovernanceDid.NervousSystemFunction = {
        id: 3n,
        name: "Unknown",
        description: [],
        function_type: [],
      };

      expect(convertNervousFunction(toNervousFunctionDto(nsFunction))).toEqual(
        nsFunction
      );
    });
  });

  describe("toListTopicsResponseDto", () => {
    it("should round trip topics and uncategorized functions", () => {
      const topics: SnsGovernanceDid.ListTopicsResponse = {
        topics: [
          [
            {
              ...topicInfoMock,
              native_functions: [[nativeNervousSystemFunctionMock]],
              custom_functions: [[genericFunctionWithTarget]],
            },
          ],
        ],
        uncategorized_functions: [[genericNervousSystemFunctionMock]],
      };

      expect(
        convertDtoToListTopicsResponse(toListTopicsResponseDto(topics))
      ).toEqual(topics);
    });
  });

  describe("toTokenMetadataDto", () => {
    it("should round trip Nat and Text values", () => {
      expect(convertIcrc1Metadata(toTokenMetadataDto(tokenMetadata))).toEqual(
        tokenMetadata
      );
    });

    it("should round trip values larger than 32 bits", () => {
      const metadata: IcrcTokenMetadataResponse = [
        ["large:nat", { Nat: 2n ** 70n + 5n }],
        ["large:int", { Int: 2n ** 40n + 1n }],
        ["zero", { Nat: 0n }],
      ];

      expect(convertIcrc1Metadata(toTokenMetadataDto(metadata))).toEqual(
        metadata
      );
    });

    it("should round trip Blob values", () => {
      const metadata: IcrcTokenMetadataResponse = [
        ["blob", { Blob: new Uint8Array([1, 2, 3]) }],
      ];

      expect(convertIcrc1Metadata(toTokenMetadataDto(metadata))).toEqual(
        metadata
      );
    });

    it("should convert Nat64 to Nat", () => {
      expect(toTokenMetadataDto([["nat64", { Nat64: 7n }]])).toEqual([
        ["nat64", { Nat: [7] }],
      ]);
    });

    it("should drop values that the aggregator format does not have", () => {
      expect(
        toTokenMetadataDto([
          ["negative", { Int: -1n }],
          ["array", { Array: [] }],
          ["map", { Map: [] }],
          ["text", { Text: "kept" }],
        ])
      ).toEqual([["text", { Text: "kept" }]]);
    });
  });

  describe("toCachedSnsDto", () => {
    const canisterIds = {
      root: principal(10),
      governance: principal(11),
      ledger: principal(12),
      swap: principal(13),
      index: principal(14),
      dapps: [principal(15)],
      archives: [principal(16)],
    };

    const data: ImportedSnsData = {
      canisterIds,
      metadata: {
        url: ["https://example.com"],
        logo: ["data:image/png;base64,abc"],
        name: ["Test SNS"],
        description: ["An SNS for tests"],
      },
      functions: {
        reserved_ids: BigUint64Array.from([1013n]),
        functions: [nativeNervousSystemFunctionMock, genericFunctionWithTarget],
      },
      parameters: fullParameters,
      topics: {
        topics: [[topicInfoMock]],
        uncategorized_functions: [[]],
      },
      tokenMetadata,
      fee: 10_000n,
      totalSupply: 100_000_000_000n,
    };

    it("should convert the canister IDs", () => {
      const dto = toCachedSnsDto(data);

      expect(dto.canister_ids).toEqual({
        root_canister_id: canisterIds.root.toText(),
        governance_canister_id: canisterIds.governance.toText(),
        ledger_canister_id: canisterIds.ledger.toText(),
        swap_canister_id: canisterIds.swap.toText(),
        index_canister_id: canisterIds.index.toText(),
      });
      expect(dto.list_sns_canisters).toEqual({
        root: canisterIds.root.toText(),
        governance: canisterIds.governance.toText(),
        ledger: canisterIds.ledger.toText(),
        swap: canisterIds.swap.toText(),
        index: canisterIds.index.toText(),
        dapps: [principal(15).toText()],
        archives: [principal(16).toText()],
      });
    });

    it("should convert the governance and ledger data", () => {
      const dto = toCachedSnsDto(data);

      expect(dto.meta).toEqual({
        url: "https://example.com",
        name: "Test SNS",
        description: "An SNS for tests",
      });
      expect(dto.parameters).toEqual({
        functions: [
          toNervousFunctionDto(nativeNervousSystemFunctionMock),
          toNervousFunctionDto(genericFunctionWithTarget),
        ],
        reserved_ids: [1013],
      });
      expect(dto.nervous_system_parameters).toEqual(
        toNervousSystemParametersDto(fullParameters)
      );
      expect(dto.topics).toEqual(toListTopicsResponseDto(data.topics));
      expect(dto.icrc1_metadata).toEqual(toTokenMetadataDto(tokenMetadata));
      expect(dto.icrc1_fee).toEqual([10_000]);
      expect(dto.icrc1_total_supply).toBe(100_000_000_000);
    });

    it("should leave the topics empty if they are missing", () => {
      expect(toCachedSnsDto({ ...data, topics: undefined }).topics).toBe(
        undefined
      );
    });

    it("should set the lifecycle to committed", () => {
      const dto = toCachedSnsDto(data);

      expect(dto.lifecycle?.lifecycle).toBe(SnsSwapLifecycle.Committed);
      expect(dto.swap_state.swap.lifecycle).toBe(SnsSwapLifecycle.Committed);
    });

    it("should give a valid summary", () => {
      const summary = convertDtoToSnsSummary(toCachedSnsDto(data));

      expect(summary).toBeDefined();
      expect(summary?.rootCanisterId.toText()).toBe(canisterIds.root.toText());
      expect(summary?.governanceCanisterId.toText()).toBe(
        canisterIds.governance.toText()
      );
      expect(summary?.ledgerCanisterId.toText()).toBe(
        canisterIds.ledger.toText()
      );
      expect(summary?.indexCanisterId.toText()).toBe(
        canisterIds.index.toText()
      );
      expect(summary?.metadata.name).toBe("Test SNS");
      expect(summary?.token.symbol).toBe("TST");
      expect(summary?.token.decimals).toBe(8);
      expect(summary?.lifecycle.lifecycle).toEqual([
        SnsSwapLifecycle.Committed,
      ]);
    });
  });
});
