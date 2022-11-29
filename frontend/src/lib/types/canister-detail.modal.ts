import type { Principal } from "@dfinity/principal";

export type CanisterDetailsModalType =
  | "add-cycles"
  | "detach"
  | "add-controller"
  | "remove-controller";

export interface CanisterDetailsModal<D = void> {
  type: CanisterDetailsModalType;
  detail?: D;
}

export type CanisterDetailsModalRemoveController = Required<
  Pick<CanisterDetailsModal<{ controller: string }>, "detail">
> &
  Pick<CanisterDetailsModal, "type">;

export type CanisterDetailsModalDetach = Required<
  Pick<CanisterDetailsModal<{ canisterId: Principal }>, "detail">
> &
  Pick<CanisterDetailsModal, "type">;
