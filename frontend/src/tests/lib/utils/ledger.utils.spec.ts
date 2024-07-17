import { ExtendedLedgerError } from "$lib/constants/ledger.constants";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import { decodePublicKey, decodeSignature } from "$lib/utils/ledger.utils";
import { mockPrincipalText } from "$tests/mocks/auth.store.mock";
import {
  MockLedgerIdentity,
  derEncodedPublicKeyHex,
  fromHexString,
  rawPublicKeyHex,
} from "$tests/mocks/ledger.identity.mock";
import {
  LedgerError,
  type ResponseAddress,
  type ResponseSign,
} from "@zondax/ledger-icp";

describe("ledger-utils", () => {
  describe("decodePublicKey", () => {
    const principalText = new MockLedgerIdentity().getPrincipal().toText();

    it("should throw an error because ledger is closed", () => {
      const call = () =>
        decodePublicKey({
          principalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
          returnCode: ExtendedLedgerError.AppNotOpen as unknown as LedgerError,
        } as ResponseAddress);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({ message: "error__ledger.please_open" })
      );
    });

    it("should throw an error because ledger is locked", () => {
      const call = () =>
        decodePublicKey({
          principalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
          returnCode: LedgerError.TransactionRejected,
        } as ResponseAddress);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({ message: "error__ledger.locked" })
      );
    });

    it("should throw an error because public key cannot be fetched", () => {
      const call = () =>
        decodePublicKey({
          principalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
          returnCode:
            ExtendedLedgerError.CannotFetchPublicKey as unknown as LedgerError,
        } as ResponseAddress);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({ message: "error__ledger.fetch_public_key" })
      );
    });

    it("should throw an error because principal does not match", async () => {
      const call = () =>
        decodePublicKey({
          principalText: mockPrincipalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
        } as ResponseAddress);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({ message: "error__ledger.principal_not_match" })
      );
    });

    it("should return a Secp256k1 public key", async () => {
      const publicKey = await decodePublicKey({
        principalText,
        publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
      } as ResponseAddress);

      const expectedDerPublicKey = fromHexString(derEncodedPublicKeyHex);
      expect(publicKey.toDer()).toEqual(expectedDerPublicKey);
    });
  });

  describe("decodeSignature", () => {
    it("should throw an error if no signature is provided", () => {
      const call = () =>
        decodeSignature({
          signatureRS: undefined,
          returnCode: LedgerError.UnknownError,
        } as unknown as ResponseSign);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({
          message: `A ledger error happened during signature. undefined (code ${LedgerError.UnknownError}).`,
        })
      );
    });

    it("should throw an error if transaction is rejected", () => {
      const call = () =>
        decodeSignature({
          signatureRS: Uint8Array.from("test", (x) => x.charCodeAt(0)),
          returnCode: LedgerError.TransactionRejected,
        } as unknown as ResponseSign);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({
          message: "error__ledger.user_rejected_transaction",
        })
      );
    });

    it("should throw an error if signature too short", () => {
      const test = "test";

      const call = () =>
        decodeSignature({
          signatureRS: Uint8Array.from(test, (x) => x.charCodeAt(0)),
          returnCode: LedgerError.WrongLength,
        } as unknown as ResponseSign);

      expect(call).rejects.toThrow(
        new LedgerErrorKey({
          message: `Signature must be 64 bytes long (is ${test.length})`,
        })
      );
    });

    it("should return a signature", async () => {
      const signature = await decodeSignature({
        signatureRS: Uint8Array.from(
          "0410d34980a51af89d3331ad5fa80fe30d8868ad87526460b3b3e15596ee58e8",
          (x) => x.charCodeAt(0)
        ),
        returnCode: LedgerError.NoErrors,
      } as unknown as ResponseSign);

      expect(signature).not.toBeNull();
    });
  });
});
