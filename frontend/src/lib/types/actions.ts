export enum ActionType {
  Send = "send",
  GoToTokenDetail = "goToTokenDetail",
  Receive = "receive",
}

export type Action<T> = {
  type: ActionType;
  data: T;
};
