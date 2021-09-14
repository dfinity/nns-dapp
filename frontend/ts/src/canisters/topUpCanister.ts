import { Principal } from "@dfinity/principal";
import LedgerService from "./ledger/model";
import NnsDappService from "./nnsDapp/model";
import NNS_DAPP_CANISTER_ID from "./nnsDapp/canisterId";
import { CanisterIdString, E8s } from "./common/types";
import * as convert from "./converter";
import { TOP_UP_CANISTER_MEMO } from "./constants";
import { pollUntilComplete } from "./multiPartTransactionPollingHandler";

export type TopUpCanisterRequest = {
  amount: E8s;
  fromSubAccountId?: number;
  canisterId: CanisterIdString;
};

export type TopUpCanisterResponse =
  | { complete: null }
  | { error: { message: string; refunded: boolean } };

export async function topUpCanisterImpl(
  principal: Principal,
  ledgerService: LedgerService,
  nnsDappService: NnsDappService,
  request: TopUpCanisterRequest
): Promise<TopUpCanisterResponse> {
  const toSubAccount = buildSubAccount(request.canisterId);
  const recipient = convert.principalToAccountIdentifier(
    NNS_DAPP_CANISTER_ID,
    toSubAccount
  );
  const blockHeight = await ledgerService.sendICPTs({
    memo: TOP_UP_CANISTER_MEMO,
    amount: request.amount,
    to: recipient,
    fromSubAccountId: request.fromSubAccountId,
  });

  const outcome = await pollUntilComplete(
    nnsDappService,
    principal,
    blockHeight
  );

  if ("Complete" in outcome) {
    return { complete: null };
  } else if ("Refunded" in outcome) {
    return { error: { message: outcome.Refunded[1], refunded: true } };
  } else if ("Error" in outcome) {
    return { error: { message: outcome.Error, refunded: false } };
  } else {
    throw new Error("Unable to top-up canister");
  }
}

// 32 bytes
function buildSubAccount(canisterId: CanisterIdString): Uint8Array {
  const bytes = Principal.fromText(canisterId).toUint8Array();
  const subAccount = new Uint8Array(32);
  subAccount[0] = bytes.length;
  subAccount.set(bytes, 1);
  return subAccount;
}
