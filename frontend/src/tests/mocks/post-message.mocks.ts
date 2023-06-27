import { nonNullish } from "@dfinity/utils";

export class PostMessageMock<T extends MessageEvent> {
  private _callback: ((params: T) => Promise<void>) | undefined;

  subscribe(callback: (params: T) => Promise<void>) {
    this._callback = callback;
  }

  emit(params: T) {
    this._callback?.(params);
  }

  get ready(): boolean {
    return nonNullish(this._callback);
  }
}
