export class LedgerErrorKey extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class LedgerErrorMessage extends Error {}

// TransportError is exposed as a function not an interface from @ledgerhq/errors so we redeclare it
// Neither is CustomError exposed
export interface LedgerHQTransportError {
  name: string;
  message: string;
  id: string;
}
