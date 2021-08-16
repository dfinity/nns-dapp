import { Principal } from "@dfinity/principal";
import { sha256 } from "js-sha256";
import LedgerService from "./ledger/model";
import GovernanceService from "./governance/model";
import GOVERNANCE_CANISTER_ID from "./governance/canisterId";
import randomBytes from "randombytes";
import { E8s, NeuronId } from "./common/types";
import * as convert from "./converter";

export type CreateNeuronRequest = {
  stake: E8s;
  fromSubAccountId?: number;
};

export default async function (
  principal: Principal,
  ledgerService: LedgerService,
  governanceService: GovernanceService,
  request: CreateNeuronRequest
): Promise<NeuronId> {
  const nonceBytes = new Uint8Array(randomBytes(8));
  const nonce = convert.uint8ArrayToBigInt(nonceBytes);
  const toSubAccount = buildSubAccount(nonceBytes, principal);

  const accountIdentifier = convert.principalToAccountIdentifier(
    GOVERNANCE_CANISTER_ID,
    toSubAccount
  );

  // Send amount to the ledger.
  await ledgerService.sendICPTs({
    memo: nonce,
    amount: request.stake,
    to: accountIdentifier,
    fromSubAccountId: request.fromSubAccountId,
  });

  // Notify the governance of the transaction so that the neuron is created.
  return await governanceService.claimOrRefreshNeuronFromAccount(
    principal,
    nonce
  );
}

// 32 bytes
function buildSubAccount(nonce: Uint8Array, principal: Principal): Uint8Array {
  const padding = convert.asciiStringToByteArray("neuron-stake");
  const shaObj = sha256.create();
  shaObj.update([0x0c, ...padding, ...principal.toUint8Array(), ...nonce]);
  return new Uint8Array(shaObj.array());
}
