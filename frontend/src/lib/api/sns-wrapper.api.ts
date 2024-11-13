import { createAgent } from "$lib/api/agent.api";
import { HOST } from "$lib/constants/environment.constants";
import { ApiErrorKey } from "$lib/types/api.errors";
import type { QueryRootCanisterId } from "$lib/types/sns.query";
import type { Agent, Identity } from "@dfinity/agent";
import { IcrcIndexCanister, IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import {
  SnsGovernanceCanister,
  SnsRootCanister,
  SnsSwapCanister,
  SnsWrapper,
} from "@dfinity/sns";
// The API layer should not depend on the services layer.
// Wrappers don't really fit into the API layer, but a lot of API functions
// currently use wrappers. Ideally they would use SNS canisters directly.
// So until we can clean this app, we make an exception to allow this one
// dependency from the API layer to the services layer.
import { getLoadedSnsAggregatorData } from "$lib/services/public/sns.services";

interface IdentityWrapper {
  [principal: string]: Promise<Map<QueryRootCanisterId, SnsWrapper>>;
}

let identitiesCertifiedWrappers: IdentityWrapper = {};
let identitiesNotCertifiedWrappers: IdentityWrapper = {};

// ONLY FOR TESTING PURPOSES
export const clearWrapperCache = () => {
  identitiesCertifiedWrappers = {};
  identitiesNotCertifiedWrappers = {};
};

type CanisterIds = {
  rootCanisterId: Principal;
  governanceCanisterId: Principal;
  ledgerCanisterId: Principal;
  swapCanisterId: Principal;
  indexCanisterId: Principal;
};

const buildWrapper = ({
  agent,
  certified,
  canisterIds: {
    rootCanisterId,
    governanceCanisterId,
    ledgerCanisterId,
    swapCanisterId,
    indexCanisterId,
  },
}: {
  agent: Agent;
  certified: boolean;
  canisterIds: CanisterIds;
}) => {
  return new SnsWrapper({
    root: SnsRootCanister.create({ canisterId: rootCanisterId, agent }),
    governance: SnsGovernanceCanister.create({
      canisterId: governanceCanisterId,
      agent,
    }),
    ledger: IcrcLedgerCanister.create({ canisterId: ledgerCanisterId, agent }),
    swap: SnsSwapCanister.create({ canisterId: swapCanisterId, agent }),
    index: IcrcIndexCanister.create({ canisterId: indexCanisterId, agent }),
    certified,
  });
};

const loadSnsWrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<SnsWrapper[]> => {
  const aggregatorData = await getLoadedSnsAggregatorData();
  const agent = await createAgent({
    identity,
    host: HOST,
  });
  return aggregatorData.map(({ canister_ids }) => {
    const rootCanisterId = Principal.fromText(canister_ids.root_canister_id);
    const swapCanisterId = Principal.fromText(canister_ids.swap_canister_id);
    const governanceCanisterId = Principal.fromText(
      canister_ids.governance_canister_id
    );
    const ledgerCanisterId = Principal.fromText(
      canister_ids.ledger_canister_id
    );
    const indexCanisterId = Principal.fromText(canister_ids.index_canister_id);
    return buildWrapper({
      agent,
      certified,
      canisterIds: {
        rootCanisterId,
        governanceCanisterId,
        ledgerCanisterId,
        swapCanisterId,
        indexCanisterId,
      },
    });
  });
};

const initWrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<Map<QueryRootCanisterId, SnsWrapper>> =>
  new Map(
    (await loadSnsWrappers({ identity, certified })).map(
      (wrapper: SnsWrapper) => [
        wrapper.canisterIds.rootCanisterId.toText(),
        wrapper,
      ]
    )
  );

export const wrappers = async ({
  identity,
  certified,
}: {
  certified: boolean;
  identity: Identity;
}): Promise<Map<QueryRootCanisterId, SnsWrapper>> => {
  const principalText = identity.getPrincipal().toText();
  if (certified) {
    if (identitiesCertifiedWrappers[principalText] === undefined) {
      // the initialization of the wrappers can be called mutliple times at the same time when the app loads.
      // We cache the promise so that if multiple calls are made then all will resolve when the first init resolve.
      identitiesCertifiedWrappers[principalText] = initWrappers({
        identity,
        certified,
      });
    }
    return identitiesCertifiedWrappers[principalText];
  } else {
    if (identitiesNotCertifiedWrappers[principalText] === undefined) {
      identitiesNotCertifiedWrappers[principalText] = initWrappers({
        identity,
        certified,
      });
    }
    return identitiesNotCertifiedWrappers[principalText];
  }
};

export const wrapper = async ({
  identity,
  rootCanisterId,
  certified,
}: {
  identity: Identity;
  rootCanisterId: QueryRootCanisterId;
  certified: boolean;
}): Promise<SnsWrapper> => {
  const snsWrapper: SnsWrapper | undefined = (
    await wrappers({ identity, certified })
  ).get(rootCanisterId);

  if (snsWrapper === undefined) {
    throw new ApiErrorKey("error__sns.undefined_project");
  }

  return snsWrapper;
};
