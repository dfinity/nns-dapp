import type { UserTokenData } from "$lib/types/tokens-page";

export enum ActionType {
  Send = "send",
  Receive = "receive",
  Remove = "remove",
}

export type Action = {
  type: ActionType;
  data: UserTokenData;
};
