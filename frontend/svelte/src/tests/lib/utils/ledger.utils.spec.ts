import { LedgerError, type ResponseAddress } from "@zondax/ledger-icp";
import { ExtendedLedgerError } from "../../../lib/constants/ledger.constants";
import { LedgerErrorKey } from "../../../lib/errors/ledger.errors";
import { decodePublicKey } from "../../../lib/utils/ledger.utils";
import { mockPrincipalText } from "../../mocks/auth.store.mock";
import {
  derEncodedPublicKeyHex,
  fromHexString,
  MockLedgerIdentity,
  rawPublicKeyHex,
} from "../../mocks/ledger.identity.mock";

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

      expect(call).toThrow(new LedgerErrorKey("error__ledger.please_open"));
    });

    it("should throw an error because ledger is locked", () => {
      const call = () =>
        decodePublicKey({
          principalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
          returnCode: LedgerError.TransactionRejected,
        } as ResponseAddress);

      expect(call).toThrow(new LedgerErrorKey("error__ledger.locked"));
    });

    it("should throw an error because public key cannot be fetched", () => {
      const call = () =>
        decodePublicKey({
          principalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
          returnCode:
            ExtendedLedgerError.CannotFetchPublicKey as unknown as LedgerError,
        } as ResponseAddress);

      expect(call).toThrow(
        new LedgerErrorKey("error__ledger.fetch_public_key")
      );
    });

    it("should throw an error because principal does not match", () => {
      const call = () =>
        decodePublicKey({
          principalText: mockPrincipalText,
          publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
        } as ResponseAddress);

      expect(call).toThrow(
        new LedgerErrorKey("error__ledger.principal_not_match")
      );
    });

    it("should return a Secp256k1 public key", () => {
      const publicKey = decodePublicKey({
        principalText,
        publicKey: fromHexString(rawPublicKeyHex) as unknown as Buffer,
      } as ResponseAddress);

      const expectedDerPublicKey = fromHexString(derEncodedPublicKeyHex);
      expect(publicKey.toDer()).toEqual(expectedDerPublicKey);
    });
  });
});
