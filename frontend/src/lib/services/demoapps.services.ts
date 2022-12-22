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

  const meta: CanisterMeta[] = [
    {
      meta: {
        name: "Papyrs",
        logo: "https://daviddalbusco.com/images/portfolio/icons/papyrs-icon.png",
        theme: "#C4CDFF",
        url: [],
        description: [],
      },
      canisterId: Principal.fromText("qsgjb-riaaa-aaaaa-aaaga-cai"),
    },
    {
      meta: {
        name: "DeckDeckGo",
        theme: "#3a81fe",
        url: ["https://deckdeckgo.com"],
        description: ["An open source web editor for presentations."],
        logo: "https://daviddalbusco.com/images/portfolio/icons/deckdeckgo-icon.png",
      },
      canisterId: Principal.fromText("qsgjb-riaaa-aaaaa-aaaga-cai"),
    },
  ];

  return [...results, ...meta].filter(
    (meta) => meta !== undefined
  ) as CanisterMeta[];
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
