import type { UniverseCanisterId } from "$lib/types/universe";
import type { IcrcTokenMetadata } from "./icrc";

export type IcrcTokenModalType = "icrc-send";

export type IcrcTokenTransactionModalData = {
  universeId: UniverseCanisterId;
  token: IcrcTokenMetadata;
  reloadAccountFromStore: (() => void) | undefined;
  loadTransactions: boolean;
};

export interface IcrcTokenModalProps {
  type: IcrcTokenModalType;
  data: IcrcTokenTransactionModalData;
}
