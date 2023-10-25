import type { Principal } from "@dfinity/principal";
import type { TokenAmount } from "@dfinity/utils";

export enum UserTokenAction {
  Send = "send",
  GoToDetail = "goToDetail",
  Receive = "receive",
}

export type UserTokenData = {
  universeId: Principal;
  title: string;
  balance: TokenAmount;
  logo: string;
  actions: UserTokenAction[];
};
