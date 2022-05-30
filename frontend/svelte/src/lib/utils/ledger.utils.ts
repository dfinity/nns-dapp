import type { Signature } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type { ResponseAddress, ResponseSign } from "@zondax/ledger-icp";
import { LedgerError } from "@zondax/ledger-icp";
import { get } from "svelte/store";
import {
  ExtendedLedgerError,
  LEDGER_SIGNATURE_LENGTH,
  type AllLedgerError,
} from "../constants/ledger.constants";
import { LedgerErrorKey, LedgerErrorMessage } from "../types/ledger.errors";
import { Secp256k1PublicKey } from "../keys/secp256k1";
import { i18n } from "../stores/i18n";
import { replacePlaceholders } from "./i18n.utils";

export const decodePublicKey = ({
  principalText,
  publicKey: responsePublicKey,
  returnCode,
}: ResponseAddress): Secp256k1PublicKey => {
  // See ledger.constants for more information about type casting
  const code: AllLedgerError = returnCode as AllLedgerError;

  if (code === ExtendedLedgerError.AppNotOpen) {
    throw new LedgerErrorKey("error__ledger.please_open");
  }

  if (code == LedgerError.TransactionRejected) {
    throw new LedgerErrorKey("error__ledger.locked");
  }

  if (code === ExtendedLedgerError.CannotFetchPublicKey) {
    throw new LedgerErrorKey("error__ledger.fetch_public_key");
  }

  const publicKey: Secp256k1PublicKey = Secp256k1PublicKey.fromRaw(
    new Uint8Array(responsePublicKey)
  );

  if (
    principalText !==
    Principal.selfAuthenticating(new Uint8Array(publicKey.toDer())).toText()
  ) {
    throw new LedgerErrorKey("error__ledger.principal_not_match");
  }

  return publicKey;
};

export const decodeSignature = ({
  signatureRS,
  returnCode,
  errorMessage,
}: ResponseSign): Signature => {
  const labels = get(i18n);

  if (returnCode === LedgerError.TransactionRejected) {
    throw new LedgerErrorKey("error__ledger.user_rejected_transaction");
  }
  if (signatureRS === null || signatureRS === undefined) {
    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.signature_unexpected, {
        $code: `${returnCode}`,
        $message: JSON.stringify(errorMessage),
      })
    );
  }

  const { byteLength, length } = signatureRS;

  if (byteLength !== LEDGER_SIGNATURE_LENGTH) {
    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.signature_length, {
        $length: `${length}`,
      })
    );
  }

  return bufferToArrayBuffer(signatureRS) as Signature;
};

const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
