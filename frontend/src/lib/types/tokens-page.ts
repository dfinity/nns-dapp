import type { Principal } from "@dfinity/principal";
import type { TokenAmount } from "@dfinity/utils";

export enum UserTokenActions {
  Send = "send",
  GoToDetail = "goToDetail",
  Receive = "receive",
}

export type UserTokenData = {
  canisterId: Principal;
  title: string;
  balance: TokenAmount;
  logo: string;
  actions: UserTokenActions[];
};
