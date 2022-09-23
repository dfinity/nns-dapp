import { Principal } from "@dfinity/principal";

interface SnsAccount {
  owner: Principal;
  subaccount?: Uint8Array;
}

const shrink = (bytes: Uint8Array): Uint8Array => {
  const shrinked = Array.from(bytes);
  while (shrinked[0] === 0) {
    shrinked.shift();
  }
  return Uint8Array.from(shrinked);
};

// Reference: https://github.com/dfinity/ICRC-1/pull/55/files#diff-b335630551682c19a781afebcf4d07bf978fb1f8ac04c6bf87428ed5106870f5R238
export const encodeSnsAccount = ({ owner, subaccount }: SnsAccount): string => {
  if (subaccount === undefined) {
    return owner.toText();
  }

  const subaccountBytes = shrink(subaccount);

  if (subaccountBytes.length === 0) {
    return owner.toText();
  }

  const bytes = Uint8Array.from([
    ...owner.toUint8Array(),
    ...subaccountBytes,
    subaccountBytes.length,
    parseInt("FF", 16),
  ]);

  return Principal.fromUint8Array(bytes).toText();
};

// Reference: https://github.com/dfinity/ICRC-1/pull/55/files#diff-b335630551682c19a781afebcf4d07bf978fb1f8ac04c6bf87428ed5106870f5R268
export const decodeSnsAccount = (accountString: string): SnsAccount => {
  const principal = Principal.fromText(accountString);

  const [ff, nonZeroLength, ...restReversed] = principal
    .toUint8Array()
    .reverse();

  if (ff !== parseInt("FF", 16)) {
    return {
      owner: Principal.fromText(accountString),
    };
  }

  if (
    nonZeroLength > 32 ||
    nonZeroLength === 0 ||
    nonZeroLength === undefined
  ) {
    throw new Error("Invalid account string");
  }

  const subaccountBytesReversed = restReversed.slice(0, nonZeroLength);
  if (
    subaccountBytesReversed[0] === 0 ||
    subaccountBytesReversed.length !== nonZeroLength
  ) {
    throw new Error("Invalid account string");
  }
  while (subaccountBytesReversed.length < 32) {
    subaccountBytesReversed.push(0);
  }
  const subaccount = Uint8Array.from(subaccountBytesReversed.reverse());

  const principalBytes = restReversed
    .reverse()
    .filter((_, i) => i < restReversed.length - nonZeroLength);

  return {
    owner: Principal.fromUint8Array(Uint8Array.from(principalBytes)),
    subaccount,
  };
};
