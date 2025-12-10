import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";

export const nervousSystemFunctionMock: SnsGovernanceDid.NervousSystemFunction =
  {
    id: 30n,
    name: "Governance",
    description: ["This is a description"],
    function_type: [{ NativeNervousSystemFunction: {} }],
  };

export const allTopicsNervousSystemFunctionMock: SnsGovernanceDid.NervousSystemFunction =
  {
    id: 0n,
    name: "All Topics",
    description: ["Catch-all w.r.t to following for all types of proposals."],
    function_type: [
      {
        NativeNervousSystemFunction: {},
      },
    ],
  };

export const nativeNervousSystemFunctionMock: SnsGovernanceDid.NervousSystemFunction =
  {
    id: 1n,
    name: "Motion",
    description: [
      "Side-effect-less proposals to set general governance direction.",
    ],
    function_type: [
      {
        NativeNervousSystemFunction: {},
      },
    ],
  };

export const genericNervousSystemFunctionMock: SnsGovernanceDid.NervousSystemFunction =
  {
    id: 1001n,
    name: "Generic Motion",
    description: ["Proposal to upgrade the WASM of a core SNS canister."],
    function_type: [
      {
        GenericNervousSystemFunction: {
          validator_canister_id: [],
          target_canister_id: [],
          validator_method_name: [],
          topic: [],
          target_method_name: [],
        },
      },
    ],
  };
