import { Agent, QueryResponseStatus } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export const submitQueryRequest = async (
  agent: Agent,
  canisterId: Principal,
  methodName: string,
  bytes: Uint8Array
): Promise<Uint8Array> => {
  const arg = bytes.buffer;

  const queryResponse = await agent.query(canisterId, {
    methodName,
    arg
  });

  if (queryResponse.status == QueryResponseStatus.Rejected) {
    throw new Error(
      [
        'Call failed:',
        `  Method: ${methodName}`,
        `  Canister ID: ${canisterId}`,
        `  HTTP status code: ${queryResponse.reject_code}`,
        `  HTTP status text: ${queryResponse.reject_message}`
      ].join('\n')
    );
  }

  return new Uint8Array(queryResponse.reply.arg);
};
