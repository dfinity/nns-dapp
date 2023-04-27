export class CkBTCErrorKey extends Error {}

export class CkBTCInfoKey {
  public readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class CkBTCErrorRetrieveBtcMinAmount extends Error {}
