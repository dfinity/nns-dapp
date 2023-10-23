import type { Principal } from "@dfinity/principal";
import type { TokenAmount } from "@dfinity/utils";

export type UserTokenData = {
  canisterId: Principal;
  title: string;
  balance: TokenAmount;
  logo: string;
  actions: string[];
};
