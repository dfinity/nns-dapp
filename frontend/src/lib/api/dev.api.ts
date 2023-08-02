import { HOST, IS_TESTNET } from "$lib/constants/environment.constants";
import type { Account } from "$lib/types/account";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import type { BlockHeight, E8s, NeuronId } from "@dfinity/nns";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsGovernanceCanister, type SnsNeuronId } from "@dfinity/sns";
import { arrayOfNumberToUint8Array, toNullable } from "@dfinity/utils";
import { createAgent } from "./agent.api";
import { governanceCanister } from "./governance.api";
import { initSns, wrapper } from "./sns-wrapper.api";

export const testAccountPrincipal =
  "jg6qm-uw64t-m6ppo-oluwn-ogr5j-dc5pm-lgy2p-eh6px-hebcd-5v73i-nqe";
export const testAccountAddress =
  "5b315d2f6702cb3a27d826161797d7b2c2e131cd312aece51d4d5574d1247087";

const getTestAccountAgent = async (): Promise<HttpAgent> => {
  // Create an identity who's default ledger account is initialised with 10k ICP on the testnet, then use that
  // identity to send the current user some ICP to test things with.
  // The identity's principal is ${testAccountPrincipal}
  // The identity's default ledger address is ${testAccountAddress}
  const publicKey = "Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=";
  const privateKey =
    "N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==";
  const identity = Ed25519KeyIdentity.fromKeyPair(
    base64ToUInt8Array(publicKey),
    base64ToUInt8Array(privateKey)
  );

  const agent: HttpAgent = new HttpAgent({
    host: HOST,
    identity,
  });
  await agent.fetchRootKey();

  return agent;
};

export const getTestAccountBalance = async (
  rootCanisterId: Principal
): Promise<bigint> => {
  assertTestnet();

  const agent = await getTestAccountAgent();

  if (isUniverseNns(rootCanisterId)) {
    const ledgerCanister: LedgerCanister = LedgerCanister.create({ agent });

    return ledgerCanister.accountBalance({
      accountIdentifier: AccountIdentifier.fromHex(testAccountAddress),
    });
  }

  const { balance } = await initSns({
    agent,
    rootCanisterId,
    certified: false,
  });

  return balance({
    owner: Principal.fromText(testAccountPrincipal),
  });
};

/*
 * Gives the caller the specified amount of (fake) ICPs.
 * Should/can only be used on testnets.
 */
export const acquireICPTs = async ({
  accountIdentifier,
  e8s,
}: {
  accountIdentifier: string;
  e8s: E8s;
}): Promise<BlockHeight> => {
  assertTestnet();

  const agent = await getTestAccountAgent();

  // TODO: reproducibility
  // const validIcrcAddress = !invalidIcrcAddress(accountIdentifier);

  // Icrc
  // if (validIcrcAddress) {
  //   const canister = IcrcLedgerCanister.create({
  //     agent,
  //     canisterId: LEDGER_CANISTER_ID,
  //   });
  //
  //   const { owner, subaccount } = decodeIcrcAccount(accountIdentifier);
  //
  //   return canister.transfer({
  //     amount: e8s,
  //     to: {
  //       owner,
  //       subaccount: toNullable(subaccount),
  //     },
  //   });
  // }

  // Old school ICP
  const ledgerCanister: LedgerCanister = LedgerCanister.create({ agent });

  return ledgerCanister.transfer({
    amount: e8s,
    to: AccountIdentifier.fromHex(accountIdentifier),
  });
};

export const acquireSnsTokens = async ({
  account,
  e8s,
  rootCanisterId,
}: {
  account: Account;
  e8s: bigint;
  rootCanisterId: Principal;
}): Promise<void> => {
  assertTestnet();

  const agent = await getTestAccountAgent();

  const { transfer } = await initSns({
    agent,
    rootCanisterId,
    certified: true,
  });

  await transfer({
    amount: e8s,
    to: {
      owner: account.principal as Principal,
      subaccount:
        account.subAccount === undefined
          ? []
          : toNullable(arrayOfNumberToUint8Array(account.subAccount)),
    },
  });
};

export const makeDummyProposals = async ({
  neuronId,
  identity,
  swapCanisterId,
}: {
  neuronId: NeuronId;
  identity: Identity;
  swapCanisterId?: string;
}): Promise<void> => {
  assertTestnet();

  const { canister } = await governanceCanister({ identity });

  const dummyProposalsScriptPath = "/assets/libs/dummy-proposals.utils.js";
  const { makeDummyProposals: makeProposals } = await import(
    /* @vite-ignore */
    dummyProposalsScriptPath
  );

  await makeProposals({ neuronId, canister, swapCanisterId });
};

const assertTestnet = () => {
  if (!IS_TESTNET) {
    throw new Error('The environment is not "testnet"');
  }
};

// If ultimately we need this function in many calls, we shall move it in "converter.utils" of nns-js and expose the function
const base64ToUInt8Array = (base64String: string): Uint8Array => {
  return Uint8Array.from(window.atob(base64String), (c) => c.charCodeAt(0));
};

export const makeSnsDummyProposals = async ({
  neuronId,
  identity,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  identity: Identity;
  rootCanisterId: Principal;
}): Promise<void> => {
  assertTestnet();
  logWithTimestamp(`Making dummy proposals call...`);

  const { canisterIds } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified: true,
  });
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = SnsGovernanceCanister.create({
    agent,
    canisterId: canisterIds.governanceCanisterId,
  });
  const { snsProposals } = await import("./sns-dummy.api");

  const allCalls = await Promise.allSettled(
    snsProposals.map((proposal) =>
      canister
        .manageNeuron({
          subaccount: neuronId.id,
          command: [{ MakeProposal: proposal }],
        })
        .catch((error) => {
          console.error(
            "Error while creating dummy proposal: ",
            proposal.title
          );
          console.error(error);
          throw error;
        })
    )
  );

  if (allCalls.some((call) => call.status === "rejected")) {
    throw new Error();
  }

  logWithTimestamp(`Making dummy proposals call complete.`);
};
