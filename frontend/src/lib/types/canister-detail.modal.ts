import type { Principal } from "@dfinity/principal";

export type CanisterDetailsModalType =
  | "add-cycles"
  | "detach"
  | "add-controller"
  | "remove-controller";

export interface CanisterDetailsModal<D = void> {
  type: CanisterDetailsModalType;
  data?: D;
}

export type CanisterDetailsModalRemoveController = Required<
  Pick<CanisterDetailsModal<{ controller: string }>, "data">
> &
  Pick<CanisterDetailsModal, "type">;

export type CanisterDetailsModalDetach = Required<
  Pick<CanisterDetailsModal<{ canisterId: Principal }>, "data">
> &
  Pick<CanisterDetailsModal, "type">;
