import {
  bufEquals,
  concat,
  type DerEncodedPublicKey,
  type PublicKey,
} from "@dfinity/agent";

// TODO(L2-433): should we use @dfinity/identity-ledgerhq the implementation is 100% similar

// TODO(L2-433): if we keep this implementation within nns-dapp, hardcoded text should be extracted to i18n

// This implementation is adjusted from the Ed25519PublicKey.
// The RAW_KEY_LENGTH and DER_PREFIX are modified accordingly
export class Secp256k1PublicKey implements PublicKey {
  /**
   * Construct Secp256k1PublicKey from an existing PublicKey
   * @param {PublicKey} key
   * @returns {Secp256k1PublicKey} Instance of Secp256k1PublicKey
   */
  public static from(key: PublicKey): Secp256k1PublicKey {
    return this.fromDer(key.toDer());
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
      Secp256k1PublicKey.DER_PREFIX.buffer,
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

    const rawKey = key.slice(0, Secp256k1PublicKey.DER_PREFIX.length);
    if (!bufEquals(this.derEncode(rawKey), key)) {
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
    this.#rawKey = key;
    this.#derKey = Secp256k1PublicKey.derEncode(key);
  }

  public toDer(): DerEncodedPublicKey {
    return this.derKey;
  }

  public toRaw(): ArrayBuffer {
    return this.rawKey;
  }
}
