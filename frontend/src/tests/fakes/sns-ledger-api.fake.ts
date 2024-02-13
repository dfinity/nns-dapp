import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcAccount } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";

const modulePath = "$lib/api/sns-ledger.api";
const implementedFunctions = {
  querySnsBalance,
  transactionFee,
  getSnsToken,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

// Maps a key reppresenting identity + rootCanisterId to a list of accounts for
// that identity and sns project.
const balances: Map<string, bigint> = new Map();

type KeyParams = { identity: Identity; rootCanisterId: Principal };

const mapKey = ({ identity, rootCanisterId }: KeyParams) =>
  JSON.stringify([identity.getPrincipal().toText(), rootCanisterId.toText()]);

////////////////////////
// Fake implementations:
////////////////////////

async function querySnsBalance({
  identity,
  rootCanisterId,
  certified: _,
  account: __,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  account: IcrcAccount;
}): Promise<bigint> {
  return balances.get(mapKey({ identity, rootCanisterId })) || undefined;
}

async function transactionFee({
  identity: _,
  rootCanisterId: __,
  certified: ___,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<bigint> {
  return 10_000n;
}

async function getSnsToken({
  identity: _,
  rootCanisterId: __,
  certified: ___,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<IcrcTokenMetadata> {
  return mockSnsToken;
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  balances.clear();
};

export const setBalanceFor = ({
  identity = mockIdentity,
  rootCanisterId,
  balanceUlps,
}: {
  identity?: Identity;
  rootCanisterId: Principal;
  balanceUlps: bigint;
}) => {
  const key = mapKey({ identity, rootCanisterId });
  balances.set(key, balanceUlps);
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const install = () => {
  beforeEach(() => {
    reset();
  });
  installImplAndBlockRest({
    modulePath,
    implementedFunctions,
  });
};
