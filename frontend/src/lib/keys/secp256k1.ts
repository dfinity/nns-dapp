import {
  concat,
  fromHex,
  uint8ToBuf,
  type DerEncodedPublicKey,
  type PublicKey,
} from "@dfinity/agent";

declare type KeyLike =
  | PublicKey
  | DerEncodedPublicKey
  | ArrayBuffer
  | ArrayBufferView;

function isObject(value: unknown) {
  return value !== null && typeof value === "object";
}

/**
 * Returns a true ArrayBuffer from an ArrayBufferLike object.
 * @param bufLike a buffer-like object
 * @returns ArrayBuffer
 */
export function bufFromBufLike(
  bufLike:
    | ArrayBuffer
    | Uint8Array
    | DataView
    | ArrayBufferView
    | ArrayBufferLike
): ArrayBuffer {
  if (bufLike instanceof Uint8Array) {
    return uint8ToBuf(bufLike);
  }
  if (bufLike instanceof ArrayBuffer) {
    return bufLike;
  }
  if ("buffer" in bufLike) {
    return bufLike.buffer;
  }
  return new Uint8Array(bufLike);
}

// TODO(L2-433): should we use @dfinity/identity-ledgerhq the implementation is 100% similar

// TODO(L2-433): if we keep this implementation within nns-dapp, hardcoded text should be extracted to i18n

// This implementation is adjusted from the Ed25519PublicKey.
// The RAW_KEY_LENGTH and DER_PREFIX are modified accordingly
export class Secp256k1PublicKey implements PublicKey {
  /**
   * Construct Secp256k1PublicKey from an existing PublicKey
   * @param {unknown} maybeKey - existing PublicKey, ArrayBuffer, DerEncodedPublicKey, or hex string
   * @returns {Secp256k1PublicKey} Instance of Secp256k1PublicKey
   */
  public static from(maybeKey: unknown): Secp256k1PublicKey {
    if (typeof maybeKey === "string") {
      const key = fromHex(maybeKey);
      return this.fromRaw(key);
    } else if (isObject(maybeKey)) {
      const key = maybeKey as KeyLike;
      if (
        isObject(key) &&
        Object.hasOwnProperty.call(key, "__derEncodedPublicKey__")
      ) {
        return this.fromDer(key as DerEncodedPublicKey);
      } else if (ArrayBuffer.isView(key)) {
        const view = key as ArrayBufferView;
        return this.fromRaw(bufFromBufLike(view.buffer));
      } else if (key instanceof ArrayBuffer) {
        return this.fromRaw(key);
      } else if ("rawKey" in key) {
        return this.fromRaw(key.rawKey as ArrayBuffer);
      } else if ("derKey" in key) {
        return this.fromDer(key.derKey as DerEncodedPublicKey);
      } else if ("toDer" in key) {
        return this.fromDer(key.toDer() as ArrayBuffer);
      }
    }
    throw new Error(
      "Cannot construct Secp256k1PublicKey from the provided key."
    );
  }
  public static fromRaw(rawKey: ArrayBuffer): Secp256k1PublicKey {
    return new Secp256k1PublicKey(rawKey);
  }

  public static fromDer(derKey: DerEncodedPublicKey): Secp256k1PublicKey {
    return new Secp256k1PublicKey(this.derDecode(derKey));
  }

  // The length of secp256k1 public keys is always 65 bytes.
  private static RAW_KEY_LENGTH = 65;

  // Adding this prefix to a raw public key is sufficient to DER-encode it.
  // prettier-ignore
  private static DER_PREFIX = Uint8Array.from([
    0x30, 0x56, // SEQUENCE
    0x30, 0x10, // SEQUENCE
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ECDSA
    0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a, // OID secp256k1
    0x03, 0x42, // BIT STRING
    0x00, // no padding
  ]);

  private static derEncode(publicKey: ArrayBuffer): DerEncodedPublicKey {
    if (publicKey.byteLength !== Secp256k1PublicKey.RAW_KEY_LENGTH) {
      const bl = publicKey.byteLength;
      throw new TypeError(
        `secp256k1 public key must be ${Secp256k1PublicKey.RAW_KEY_LENGTH} bytes long (is ${bl})`
      );
    }

    const derPublicKey = concat(
      uint8ToBuf(Secp256k1PublicKey.DER_PREFIX),
      publicKey
    ) as DerEncodedPublicKey;
    derPublicKey.__derEncodedPublicKey__ = undefined;

    return derPublicKey;
  }

  private static derDecode(key: DerEncodedPublicKey): ArrayBuffer {
    const expectedLength =
      Secp256k1PublicKey.DER_PREFIX.length + Secp256k1PublicKey.RAW_KEY_LENGTH;
    if (key.byteLength !== expectedLength) {
      const bl = key.byteLength;
      throw new TypeError(
        `secp256k1 DER-encoded public key must be ${expectedLength} bytes long (is ${bl})`
      );
    }

    const equals = (b1: ArrayBuffer, b2: ArrayBuffer): boolean => {
      if (b1.byteLength !== b2.byteLength) {
        return false;
      }

      const u1 = new Uint8Array(b1);
      const u2 = new Uint8Array(b2);
      for (let i = 0; i < u1.length; i++) {
        if (u1[i] !== u2[i]) {
          return false;
        }
      }
      return true;
    };

    const rawKey = key.slice(0, Secp256k1PublicKey.DER_PREFIX.length);
    if (!equals(this.derEncode(rawKey), key)) {
      throw new TypeError(
        "secp256k1 DER-encoded public key is invalid. A valid secp256k1 DER-encoded public key " +
          `must have the following prefix: ${Secp256k1PublicKey.DER_PREFIX}`
      );
    }

    return rawKey;
  }

  #rawKey: ArrayBuffer;

  public get rawKey(): ArrayBuffer {
    return this.#rawKey;
  }

  #derKey: DerEncodedPublicKey;

  public get derKey(): DerEncodedPublicKey {
    return this.#derKey;
  }

  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  private constructor(key: ArrayBuffer) {
    this.#rawKey = bufFromBufLike(key);
    this.#derKey = Secp256k1PublicKey.derEncode(key);
  }

  public toDer(): DerEncodedPublicKey {
    return this.derKey;
  }

  public toRaw(): ArrayBuffer {
    return this.rawKey;
  }
}
