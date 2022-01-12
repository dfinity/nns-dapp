import { Agent, QueryResponseStatus } from "@dfinity/agent";
import { blobFromUint8Array, blobToUint8Array } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";

export const submitQueryRequest = async (
  agent: Agent,
  canisterId: Principal,
  methodName: string,
  bytes: Uint8Array
): Promise<Uint8Array> => {
  const arg = blobFromUint8Array(bytes);

  const queryResponse = await agent.query(canisterId, {
    methodName,
    arg,
  });

  if (queryResponse.status == QueryResponseStatus.Rejected) {
    throw new Error(
      [
        "Call failed:",
        `  Method: ${methodName}`,
        `  Canister ID: ${canisterId}`,
        `  HTTP status code: ${queryResponse.reject_code}`,
        `  HTTP status text: ${queryResponse.reject_message}`,
      ].join("\n")
    );
  }

  return blobToUint8Array(queryResponse.reply.arg);
};
