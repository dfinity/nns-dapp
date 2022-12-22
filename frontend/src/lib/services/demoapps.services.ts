/**
 * ⚠️ THIS SHOULD NEVER LAND ON MAINNET ⚠️
 */
import { queryCanisters } from "$lib/api/canisters.api";
import { queryDemoAppsMeta as queryDemoAppsMetaApi } from "$lib/api/demoapps.api";
import type { Meta } from "$lib/canisters/demoapps/demoapps.did";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export type CanisterMeta = { canisterId: Principal; meta: Meta };

export const listDemoApps = async (): Promise<CanisterMeta[]> => {
  const identity: Identity = await getAuthenticatedIdentity();

  const canisters = await queryCanisters({ identity, certified: false });

  const promises = canisters.map(({ canister_id: canisterId }) =>
    queryDemoAppsMeta({ canisterId, identity })
  );
  const results = await Promise.all(promises);

  return results.filter((meta) => meta !== undefined) as CanisterMeta[];
};

const queryDemoAppsMeta = async ({
  canisterId,
  identity,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<CanisterMeta | undefined> => {
  try {
    // TODO: ⚠️ like assuming there is a common spec ⚠️
    const meta = await queryDemoAppsMetaApi({ canisterId, identity });
    return {
      canisterId,
      meta,
    };
  } catch (err: unknown) {
    return undefined;
  }
};
