export type DictionaryWorkerDataKey = string;

export interface DictionaryWorkerData {
  key: DictionaryWorkerDataKey;
  certified: boolean;
}

export type DictionaryWorkerState<T extends DictionaryWorkerData> = Record<
  DictionaryWorkerDataKey,
  T
>;

export class DictionaryWorkerStore<T extends DictionaryWorkerData> {
  private readonly EMPTY_STATE: DictionaryWorkerState<T> = {};
  private _state: DictionaryWorkerState<T> = this.EMPTY_STATE;

  update(data: T[]) {
    this._state = {
      ...this._state,
      ...data.reduce(
        (acc, { key, ...rest }) => ({
          ...acc,
          [key]: {
            key,
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

  get state(): DictionaryWorkerState<T> {
    return this._state;
  }
}
