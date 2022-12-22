/**
 * ⚠️ THIS SHOULD NEVER LAND ON MAINNET ⚠️
 */
import { queryCanisters } from "$lib/api/canisters.api";
import { queryDemoAppsMeta as queryDemoAppsMetaApi } from "$lib/api/demoapps.api";
import type { Meta } from "$lib/canisters/demoapps/demoapps.did";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export const listDemoApps = async (): Promise<Meta[]> => {
  const identity: Identity = await getAuthenticatedIdentity();

  const canisters = await queryCanisters({ identity, certified: false });

  const promises = canisters.map(({ canister_id: canisterId }) =>
    queryDemoAppsMeta({ canisterId, identity })
  );
  const results = await Promise.all(promises);

  const meta: Meta[] = [{
    name: "Papyrs",
    logo: "https://daviddalbusco.com/images/portfolio/icons/papyrs-icon.png",
    theme: "#C4CDFF",
    url: [],
    description: []
  }, {
    name: "DeckDeckGo",
    theme: "#3a81fe",
    url: ["https://deckdeckgo.com"],
    description: ["An open source web editor for presentations."],
    logo: "https://daviddalbusco.com/images/portfolio/icons/deckdeckgo-icon.png"
  }]

  return [...results, ...meta].filter((meta) => meta !== undefined) as Meta[];
};

const queryDemoAppsMeta = async (params: {
  identity: Identity;
  canisterId: Principal;
}): Promise<Meta | undefined> => {
  try {
    // TODO: ⚠️ like assuming there is a common spec ⚠️
    const result = await queryDemoAppsMetaApi(params);
    return result;
  } catch (err: unknown) {
    return undefined;
  }
};
