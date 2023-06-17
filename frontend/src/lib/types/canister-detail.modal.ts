import type { Principal } from "@dfinity/principal";

export type CanisterDetailModalType =
  | "add-cycles"
  | "unlink"
  | "add-controller"
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
