export class LedgerErrorKey extends Error {}

export class LedgerErrorMessage extends Error {}

// TransportError is exposed as a function not an interface from @ledgerhq/errors so we redeclare it
// Neither is CustomError exposed
export interface LedgerHQTransportError {
  name: string;
  message: string;
  id: string;
}
