export class CkBTCErrorKey extends Error {}

export class CkBTCSuccessKey {
  public readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class CkBTCErrorRetrieveBtcMinAmount extends Error {}
