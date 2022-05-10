import { LEDGER_DEFAULT_DERIVE_PATH } from "../../lib/constants/ledger.constants";
import { LedgerIdentity } from "../../lib/identities/ledger.identity";
import { Secp256k1PublicKey } from "../../lib/keys/secp256k1";

export const fromHexString = (hexString: string): ArrayBuffer => {
  return new Uint8Array(
    (hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16))
  ).buffer;
};

export const rawPublicKeyHex =
  "0410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b835";
export const derEncodedPublicKeyHex =
  "3056301006072A8648CE3D020106052B8104000A0342000410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e812422987d8589ba61098264df5bb9c2d3ff6fe061746b4b31a44ec26636632b835";

export const testSecp256k1Vectors: Array<[string, string]> = [
  [rawPublicKeyHex, derEncodedPublicKeyHex],
];

export const mockLedgerIdentifier =
  "4f3d4b40cdb852732601fccf8bd24dffe44957a647cb867913e982d98cf85676";

// eslint-disable-next-line
// @ts-ignore: test file
export class MockLedgerIdentity extends LedgerIdentity {
  constructor() {
    // @ts-ignore - we do not use the service for mocking purpose
    super(
      LEDGER_DEFAULT_DERIVE_PATH,
      Secp256k1PublicKey.fromRaw(fromHexString(rawPublicKeyHex))
    );
  }

  public static async create(): Promise<LedgerIdentity> {
    return new MockLedgerIdentity();
  }
}
