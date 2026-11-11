import { createAgent } from "$lib/api/agent.api";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { createAgent as createHttpAgent } from "@dfinity/utils";
import {
  IcrcLedgerCanister,
  type IcrcTokenMetadataResponse,
} from "@icp-sdk/canisters/ledger/icrc";
import {
  SnsGovernanceCanister,
  SnsRootCanister,
  type SnsGovernanceDid,
  type SnsRootDid,
} from "@icp-sdk/canisters/sns";
import {
  Actor,
  CanisterStatus,
  type ActorMethod,
  type Identity,
} from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";

export const querySnsCanisterIds = async ({
  identity,
  rootCanisterId,
  certified,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsRootDid.ListSnsCanistersResponse> => {
  logWithTimestamp(`Getting SNS canister IDs certified:${certified} call...`);

  const agent = await createAgent({ identity, host: HOST });
  const root = SnsRootCanister.create({ canisterId: rootCanisterId, agent });
  const response = await root.listSnsCanisters({ certified });

  logWithTimestamp(`Getting SNS canister IDs certified:${certified} complete.`);

  return response;
};

/**
 * Reads the controllers from the certified state of the IC.
 * The result has the same order as `canisterIds`.
 */
export const queryCanistersControllers = async ({
  identity,
  canisterIds,
}: {
  identity: Identity;
  canisterIds: Principal[];
}): Promise<Principal[][]> => {
  logWithTimestamp("Getting canister controllers call...");

  // `CanisterStatus.request` needs an `HttpAgent`.
  const agent = await createHttpAgent({
    identity,
    host: HOST,
    fetchRootKey: FETCH_ROOT_KEY,
  });
  const controllers = await Promise.all(
    canisterIds.map(async (canisterId) => {
      const status = await CanisterStatus.request({
        canisterId,
        agent,
        paths: ["controllers"],
      });
      return status.get("controllers") as Principal[];
    })
  );

  logWithTimestamp("Getting canister controllers complete.");

  return controllers;
};

type GovernanceModeService = {
  get_mode: ActorMethod<
    [Record<string, never>],
    SnsGovernanceDid.GetModeResponse
  >;
};

const governanceModeIdlFactory: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    get_mode: IDL.Func(
      [IDL.Record({})],
      [IDL.Record({ mode: IDL.Opt(IDL.Int32) })],
      ["query"]
    ),
  });

export const querySnsGovernanceMode = async ({
  identity,
  governanceCanisterId,
}: {
  identity: Identity;
  governanceCanisterId: Principal;
}): Promise<SnsGovernanceDid.GetModeResponse> => {
  logWithTimestamp("Getting SNS governance mode call...");

  const agent = await createAgent({ identity, host: HOST });
  const governance = Actor.createActor<GovernanceModeService>(
    governanceModeIdlFactory,
    { agent, canisterId: governanceCanisterId }
  );
  const response = await governance.get_mode({});

  logWithTimestamp("Getting SNS governance mode complete.");

  return response;
};

export const querySnsGovernanceData = async ({
  identity,
  governanceCanisterId,
  certified,
}: {
  identity: Identity;
  governanceCanisterId: Principal;
  certified: boolean;
}): Promise<{
  metadata: SnsGovernanceDid.GetMetadataResponse;
  functions: SnsGovernanceDid.ListNervousSystemFunctionsResponse;
  parameters: SnsGovernanceDid.NervousSystemParameters;
}> => {
  logWithTimestamp(
    `Getting SNS governance data certified:${certified} call...`
  );

  const agent = await createAgent({ identity, host: HOST });
  const governance = SnsGovernanceCanister.create({
    canisterId: governanceCanisterId,
    agent,
  });
  const [metadata, functions, parameters] = await Promise.all([
    governance.metadata({ certified }),
    governance.listNervousSystemFunctions({ certified }),
    governance.nervousSystemParameters({ certified }),
  ]);

  logWithTimestamp(
    `Getting SNS governance data certified:${certified} complete.`
  );

  return { metadata, functions, parameters };
};

export const querySnsTopics = async ({
  identity,
  governanceCanisterId,
  certified,
}: {
  identity: Identity;
  governanceCanisterId: Principal;
  certified: boolean;
}): Promise<SnsGovernanceDid.ListTopicsResponse> => {
  logWithTimestamp(`Getting SNS topics certified:${certified} call...`);

  const agent = await createAgent({ identity, host: HOST });
  const governance = SnsGovernanceCanister.create({
    canisterId: governanceCanisterId,
    agent,
  });
  const response = await governance.listTopics({ certified });

  logWithTimestamp(`Getting SNS topics certified:${certified} complete.`);

  return response;
};

export const querySnsLedgerData = async ({
  identity,
  ledgerCanisterId,
  certified,
}: {
  identity: Identity;
  ledgerCanisterId: Principal;
  certified: boolean;
}): Promise<{
  metadata: IcrcTokenMetadataResponse;
  fee: bigint;
  totalSupply: bigint;
}> => {
  logWithTimestamp(`Getting SNS ledger data certified:${certified} call...`);

  const agent = await createAgent({ identity, host: HOST });
  const ledger = IcrcLedgerCanister.create({
    canisterId: ledgerCanisterId,
    agent,
  });
  const [metadata, fee, totalSupply] = await Promise.all([
    ledger.metadata({ certified }),
    ledger.transactionFee({ certified }),
    ledger.totalTokensSupply({ certified }),
  ]);

  logWithTimestamp(`Getting SNS ledger data certified:${certified} complete.`);

  return { metadata, fee, totalSupply };
};
