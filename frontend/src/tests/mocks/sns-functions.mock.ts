import type { SnsNervousSystemFunction } from "@dfinity/sns";

export const nervousSystemFunctionMock: SnsNervousSystemFunction = {
  id: BigInt(30),
  name: "Governance",
  description: ["This is a description"],
  function_type: [{ NativeNervousSystemFunction: {} }],
};

export const allTopicsNervousSystemFunctionMock: SnsNervousSystemFunction = {
  id: 0n,
  name: "All Topics",
  description: ["Catch-all w.r.t to following for all types of proposals."],
  function_type: [
    {
      NativeNervousSystemFunction: {},
    },
  ],
};

export const nativeNervousSystemFunctionMock: SnsNervousSystemFunction = {
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

export const genericNervousSystemFunctionMock: SnsNervousSystemFunction = {
  id: 1001n,
  name: "Generic Motion",
  description: ["Proposal to upgrade the WASM of a core SNS canister."],
  function_type: [
    {
      GenericNervousSystemFunction: {
        validator_canister_id: [],
        target_canister_id: [],
        validator_method_name: [],
        target_method_name: [],
      },
    },
  ],
};
