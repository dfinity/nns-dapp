import type { ICP } from "@dfinity/nns";

export interface Account {
  identifier: string;
  balance: ICP;
}
