import { Agent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { QueryResponseStatus } from "@dfinity/agent";
import { polling } from "@dfinity/agent";

/**
 * Submits an update call to the IC.
 * @returns The (binary) response if the request succeeded, an error otherwise.
 */
export const updateCall = async (
  agent: Agent,
  canisterId: Principal,
  methodName: string,
  arg: ArrayBuffer
): Promise<Uint8Array | Error> => {
  const submitResponse = await agent.call(canisterId, {
    methodName,
    arg,
    effectiveCanisterId: canisterId,
  });

  if (!submitResponse.response.ok) {
    return Error(
      [
        "Call failed:",
        `  Method: ${methodName}`,
        `  Canister ID: ${canisterId}`,
        `  Request ID: ${submitResponse.requestId}`,
        `  HTTP status code: ${submitResponse.response.status}`,
        `  HTTP status text: ${submitResponse.response.statusText}`,
      ].join("\n")
    );
  }

  try {
    const blob = await polling.pollForResponse(
      agent,
      canisterId,
      submitResponse.requestId,
      polling.defaultStrategy()
    );
    return new Uint8Array(blob);
  } catch (err) {
    if (err instanceof Error) {
      // Return errors rather than throw them so that callers are forced to handle them.
      return err;
    }

    // Something very wrong happened, and we don't know how to deal with it. Throw as-is.
    throw err;
  }
};

/**
 * Submits a query call to the IC.
 * @returns The (binary) response if the request succeeded, an error otherwise.
 */
export const queryCall = async (
  agent: Agent,
  canisterId: Principal,
  methodName: string,
  arg: ArrayBuffer
): Promise<Uint8Array | Error> => {
  const queryResponse = await agent.query(canisterId, {
    methodName,
    arg,
  });

  if (queryResponse.status == QueryResponseStatus.Rejected) {
    return new Error(
      [
        "Call failed:",
        `  Method: ${methodName}`,
        `  Canister ID: ${canisterId}`,
        `  HTTP status code: ${queryResponse.reject_code}`,
        `  HTTP status text: ${queryResponse.reject_message}`,
      ].join("\n")
    );
  }

  return new Uint8Array(queryResponse.reply.arg);
};
