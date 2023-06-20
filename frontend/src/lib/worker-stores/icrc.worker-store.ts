import type { IcrcAccountIdentifierText } from "$lib/types/icrc";

export interface IcrcWorkerData {
  accountIdentifier: IcrcAccountIdentifierText;
  certified: boolean;
}

export type IcrcWorkerState<T extends IcrcWorkerData> = Record<
  IcrcAccountIdentifierText,
  T
>;

export class IcrcWorkerStore<T extends IcrcWorkerData> {
  private readonly EMPTY_STATE: IcrcWorkerState<T> = {};
  private _state: IcrcWorkerState<T> = this.EMPTY_STATE;

  update(data: IcrcWorkerData[]) {
    this._state = {
      ...this._state,
      ...data.reduce(
        (acc, { accountIdentifier, ...rest }) => ({
          ...acc,
          [accountIdentifier]: {
            accountIdentifier,
            ...rest,
          },
        }),
        {}
      ),
    };
  }

  reset() {
    this._state = this.EMPTY_STATE;
  }

  get state(): IcrcWorkerState<T> {
    return this._state;
  }
}
