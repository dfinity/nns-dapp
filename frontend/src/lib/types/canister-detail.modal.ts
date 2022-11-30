import type { Principal } from "@dfinity/principal";

export type CanisterDetailModalType =
  | "add-cycles"
  | "detach"
  | "add-controller"
  | "remove-controller";

export interface CanisterDetailModal<D = void> {
  type: CanisterDetailModalType;
  data?: D;
}

export type CanisterDetailModalRemoveController = Required<
  Pick<CanisterDetailModal<{ controller: string }>, "data">
> &
  Pick<CanisterDetailModal, "type">;

export type CanisterDetailModalDetach = Required<
  Pick<CanisterDetailModal<{ canisterId: Principal }>, "data">
> &
  Pick<CanisterDetailModal, "type">;
