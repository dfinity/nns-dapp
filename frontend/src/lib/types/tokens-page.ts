import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
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
  subtitle?: string;
  balance: TokenAmount | UnavailableTokenAmount;
  logo: string;
  actions: UserTokenAction[];
};
