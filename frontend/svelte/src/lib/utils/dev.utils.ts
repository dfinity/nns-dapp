import { HttpAgent } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import {
  AccountIdentifier,
  BlockHeight,
  E8s,
  ICP,
  LedgerCanister,
  TransferError,
} from "@dfinity/nns";

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
}): Promise<BlockHeight | TransferError> => {
  assertTestnet();

  // Create an identity who's default ledger account is initialised with 10k ICP on the testnet, then use that
  // identity to send the current user some ICP to test things with.
  // The identity's principal is jg6qm-uw64t-m6ppo-oluwn-ogr5j-dc5pm-lgy2p-eh6px-hebcd-5v73i-nqe
  // The identity's default ledger address is 5b315d2f6702cb3a27d826161797d7b2c2e131cd312aece51d4d5574d1247087
  const publicKey = "Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=";
  const privateKey =
    "N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==";
  const identity = Ed25519KeyIdentity.fromKeyPair(
    base64ToUInt8Array(publicKey),
    base64ToUInt8Array(privateKey)
  );

  // If https://nnsdapp.dfinity.network/ is ever used anywhere else, extract or use an environment variable
  const agent: HttpAgent = new HttpAgent({
    host: "https://nnsdapp.dfinity.network/",
    identity,
  });
  await agent.fetchRootKey();

  const ledgerCanister: LedgerCanister = LedgerCanister.create({ agent });

  return ledgerCanister.transfer({
    amount: ICP.fromE8s(e8s),
    to: AccountIdentifier.fromHex(accountIdentifier),
  });
};

const assertTestnet = () => {
  if (process.env.DEPLOY_ENV !== "testnet") {
    throw new Error('The environment is not "testnet"');
  }
};

// If ultimately we need this function in many calls, we shall move it in "converter.utils" of nns-js and expose the function
const base64ToUInt8Array = (base64String: string): Uint8Array => {
  return Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
};

export const isNode = (): boolean =>
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;
