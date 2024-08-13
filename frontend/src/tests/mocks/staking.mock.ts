import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

export const mockTableProject: TableProject = {
  rowHref: `/neurons/?u=${OWN_CANISTER_ID_TEXT}`,
  domKey: OWN_CANISTER_ID_TEXT,
  title: "Internet Computer",
  logo: IC_LOGO_ROUNDED,
  neuronCount: 0,
  stake: TokenAmountV2.fromUlps({
    amount: 100_000_000n,
    token: ICPToken,
  }),
  availableMaturity: 0n,
  stakedMaturity: 0n,
};
