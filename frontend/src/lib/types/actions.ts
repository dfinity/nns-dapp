import type { UserTokenData } from "./tokens-page";

export enum ActionType {
  Send = "send",
  GoToTokenDetail = "goToTokenDetail",
  Receive = "receive",
}

export type Action = {
  type: ActionType;
  data: UserTokenData;
};
