import type { SnsNervousSystemFunction } from "@dfinity/sns";

export const nervousSystemFunctionMock: SnsNervousSystemFunction = {
  id: BigInt(30),
  name: "Governance",
  description: ["This is a description"],
  function_type: [{ NativeNervousSystemFunction: {} }],
};
