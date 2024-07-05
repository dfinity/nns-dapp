import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";

export const mockTableProject: TableProject = {
  rowHref: `/neurons/?u=${OWN_CANISTER_ID_TEXT}`,
  domKey: OWN_CANISTER_ID_TEXT,
  title: "Internet Computer",
  logo: IC_LOGO_ROUNDED,
};
