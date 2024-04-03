import type { UserTokenData } from "./tokens-page";

export enum ActionType {
  Send = "send",
  Receive = "receive",
}

export type Action = {
  type: ActionType;
  data: UserTokenData;
};
