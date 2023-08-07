import {
  ExtendedLedgerError,
  LEDGER_SIGNATURE_LENGTH,
  type AllLedgerError,
} from "$lib/constants/ledger.constants";
import { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { i18n } from "$lib/stores/i18n";
import { LedgerErrorKey, LedgerErrorMessage } from "$lib/types/ledger.errors";
import type { ReadRequest, RequestId, Signature } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import type {
  LedgerError,
  ResponseAddress,
  ResponseSign,
  ResponseSignUpdateCall,
} from "@zondax/ledger-icp";
import { get } from "svelte/store";
import { replacePlaceholders } from "./i18n.utils";

export const decodePublicKey = async ({
  principalText,
  publicKey: responsePublicKey,
  returnCode,
}: ResponseAddress): Promise<Secp256k1PublicKey> => {
  // See ledger.constants for more information about type casting
  const code: AllLedgerError = returnCode as AllLedgerError;

  if (code === ExtendedLedgerError.AppNotOpen) {
    throw new LedgerErrorKey("error__ledger.please_open");
  }

  const { LedgerError } = await import("@zondax/ledger-icp");

  if (code === LedgerError.TransactionRejected) {
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

const checkResponseCode = async (returnCode: LedgerError): Promise<void> => {
  const { LedgerError } = await import("@zondax/ledger-icp");
  if (returnCode === LedgerError.TransactionRejected) {
    throw new LedgerErrorKey("error__ledger.user_rejected_transaction");
  }
};

const checkSignature = ({
  signature,
  returnCode,
  errorMessage,
}: {
  signature?: Buffer;
  returnCode: LedgerError;
  errorMessage?: string;
}) => {
  const labels = get(i18n);

  if (isNullish(signature)) {
    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.signature_unexpected, {
        $code: `${returnCode}`,
        $message: JSON.stringify(errorMessage),
      })
    );
  }

  const { byteLength, length } = signature;

  if (byteLength !== LEDGER_SIGNATURE_LENGTH) {
    throw new LedgerErrorMessage(
      replacePlaceholders(labels.error__ledger.signature_length, {
        $length: `${length}`,
      })
    );
  }
};

export const decodeSignature = async ({
  signatureRS,
  returnCode,
  errorMessage,
}: ResponseSign): Promise<Signature> => {
  await checkResponseCode(returnCode);
  checkSignature({ signature: signatureRS, returnCode, errorMessage });

  return bufferToArrayBuffer(signatureRS) as Signature;
};

export type RequestSignatures = {
  callSignature: Signature;
  readStateSignature: Signature;
};

export const decodeUpdateSignatures = async ({
  RequestSignatureRS,
  StatusReadSignatureRS,
  returnCode,
  errorMessage,
}: ResponseSignUpdateCall): Promise<RequestSignatures> => {
  await checkResponseCode(returnCode);
  checkSignature({ signature: RequestSignatureRS, returnCode, errorMessage });
  checkSignature({
    signature: StatusReadSignatureRS,
    returnCode,
    errorMessage,
  });

  return {
    callSignature: bufferToArrayBuffer(RequestSignatureRS) as Signature,
    readStateSignature: bufferToArrayBuffer(StatusReadSignatureRS) as Signature,
  };
};

const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

// Check docs for more detais: https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-read-state
// Quote: "Moreover, all paths with prefix /request_status/<request_id> must refer to the same request ID <request_id>."
export const getRequestId = (body: ReadRequest): RequestId => body.paths[0][1];
