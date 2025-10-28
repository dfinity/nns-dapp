import type { Principal } from "@icp-sdk/core/principal";

export type CanisterDetailModalType =
  | "add-cycles"
  | "unlink"
  | "add-controller"
  | "rename"
  | "remove-controller";

export interface CanisterDetailModal {
  type: CanisterDetailModalType;
}

export interface CanisterDetailModalWithData<D> extends CanisterDetailModal {
  data: D;
}

export type CanisterDetailModalRemoveController = CanisterDetailModalWithData<{
  controller: string;
}>;

export type CanisterDetailModalDetach = CanisterDetailModalWithData<{
  canisterId: Principal;
}>;
