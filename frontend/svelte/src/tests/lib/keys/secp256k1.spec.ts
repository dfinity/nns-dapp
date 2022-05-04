import type { DerEncodedPublicKey } from "@dfinity/agent";
import { Secp256k1PublicKey } from "../../../lib/keys/secp256k1";
import {
  fromHexString,
  testSecp256k1Vectors,
} from "../../mocks/ledger.identity.mock";

// Copied from @dfinity/identity-ledgerhq

describe("secp256k1", () => {
  test("DER encoding of secp256k1 keys", async () => {
    testSecp256k1Vectors.forEach(
      ([rawPublicKeyHex, derEncodedPublicKeyHex]) => {
        const publicKey = Secp256k1PublicKey.fromRaw(
          fromHexString(rawPublicKeyHex)
        );
        const expectedDerPublicKey = fromHexString(derEncodedPublicKeyHex);
        expect(publicKey.toDer()).toEqual(expectedDerPublicKey);
      }
    );
  });

  // TODO(L2-433): test copied and adapted for hexString from @dfinity/identity-ledgerhq but fails
  // TypeError: secp256k1 public key must be 65 bytes long (is 23)

  test.skip("DER decoding of ED25519 keys", async () => {
    testSecp256k1Vectors.forEach(
      ([rawPublicKeyHex, derEncodedPublicKeyHex]) => {
        const derPublicKey = fromHexString(
          derEncodedPublicKeyHex
        ) as DerEncodedPublicKey;

        const expectedPublicKey = fromHexString(rawPublicKeyHex);
        expect(
          new Uint8Array(Secp256k1PublicKey.fromDer(derPublicKey).toRaw())
        ).toEqual(new Uint8Array(expectedPublicKey));
      }
    );
  });

  test("DER encoding of invalid keys", async () => {
    // Too short
    expect(() => {
      Secp256k1PublicKey.fromRaw(
        fromHexString(
          "0410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b8"
        )
      ).toDer();
    }).toThrow();

    // Too long
    expect(() => {
      Secp256k1PublicKey.fromRaw(
        fromHexString(
          "0410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b83500"
        )
      ).toDer();
    }).toThrow();
  });

  test("DER decoding of invalid keys", async () => {
    // Too short
    expect(() => {
      Secp256k1PublicKey.fromRaw(
        fromHexString(
          "3056301006072A8648CE3D020106052B8104000A034200" +
            "0410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b8"
        )
      );
    }).toThrow();

    // Too long
    expect(() => {
      Secp256k1PublicKey.fromRaw(
        fromHexString(
          "3056301006072A8648CE3D020106052B8104000A034200" +
            "0410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b83500"
        )
      );
    }).toThrow();

    // Invalid DER-encoding
    expect(() => {
      Secp256k1PublicKey.fromRaw(
        fromHexString(
          "2056301006072A8648CE3D020106052B8104000A0342000410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b835"
        )
      );
    }).toThrow();
  });
});
