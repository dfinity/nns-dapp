import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { buildWalletUrl } from "$lib/utils/navigation.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { Principal } from "@dfinity/principal";
import { TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

export const icpTokensListVisitors = derived<
  Readable<Universe>,
  UserTokenData[]
>(nnsUniverseStore, (nnsUniverse) => {
  const rowHref = buildWalletUrl({
    universe: OWN_CANISTER_ID_TEXT,
  });
  return [
    {
      universeId: Principal.fromText(nnsUniverse.canisterId),
      title: nnsUniverse.title,
      balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
      logo: nnsUniverse.logo,
      token: NNS_TOKEN_DATA,
      fee: TokenAmountV2.fromUlps({
        amount: NNS_TOKEN_DATA.fee,
        token: NNS_TOKEN_DATA,
      }),
      actions: [UserTokenAction.GoToDetail],
      rowHref,
      domKey: rowHref,
    },
  ];
});
