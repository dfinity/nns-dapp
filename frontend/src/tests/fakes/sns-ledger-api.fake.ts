import type { Account } from "$lib/types/account";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";

const modulePath = "$lib/api/sns-ledger.api";
const impl = {
  getSnsAccounts,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

const accounts: Map<string, Account[]> = new Map();

type KeyParams = { identity: Identity; rootCanisterId: Principal };

const mapKey = ({ identity, rootCanisterId }: KeyParams) =>
  JSON.stringify([identity.getPrincipal().toText(), rootCanisterId.toText()]);

////////////////////////
// Fake implementations:
////////////////////////

async function getSnsAccounts({
  identity,
  rootCanisterId,
  certified: _,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<Account[]> {
  return accounts.get(mapKey({ identity, rootCanisterId })) || [];
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  accounts.clear();
};

export const addAccountWith = ({
  identity = mockIdentity,
  rootCanisterId,
  ...account
}: {
  identity?: Identity;
  rootCanisterId: Principal;
} & Partial<Account>) => {
  const key = mapKey({ identity, rootCanisterId });
  let list = accounts.get(key);
  if (isNullish(list)) {
    list = [];
    accounts.set(key, list);
  }
  list.push({
    ...mockSnsMainAccount,
    ...account,
  });
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const install = () => {
  beforeEach(() => {
    reset();
  });
  installImplAndBlockRest({
    modulePath,
    impl,
  });
};
