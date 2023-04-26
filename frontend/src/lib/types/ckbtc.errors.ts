export class CkBTCErrorKey extends Error {}

export class CkBTCInfoKey {
  private readonly labelKey: string;

  constructor(labelKey: string) {
    this.labelKey = labelKey;
  }

  get key() {
    return this.labelKey;
  }
}

export class CkBTCErrorRetrieveBtcMinAmount extends Error {}
