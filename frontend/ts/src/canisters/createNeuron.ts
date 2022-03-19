import { Principal } from "@dfinity/principal";
import { sha256 } from "js-sha256";
import LedgerService from "./ledger/model";
import GovernanceService from "./governance/model";
import NnsDappService from "./nnsDapp/model";
import GOVERNANCE_CANISTER_ID from "./governance/canisterId";
import randomBytes from "randombytes";
import { BlockHeight, E8s, NeuronId } from "./common/types";
import * as convert from "./converter";
import { pollUntilComplete } from "./multiPartTransactionPollingHandler";

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
  if (request.stake < 100000000) {
    throw "Need a minimum of 1 ICP to stake a neuron";
  }

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
  return await governanceService.claimOrRefreshNeuronFromAccount({
    controller: principal,
    memo: nonce,
  });
}

/**
 * Create a neuron by sending a transaction to the Ledger and then waiting for
 * the NNS Dapp's backend to claim it.
 */
export async function createNeuronWithNnsDapp(
  principal: Principal,
  ledgerService: LedgerService,
  nnsDappService: NnsDappService,
  request: CreateNeuronRequest
): Promise<BlockHeight> {
  const nonceBytes = new Uint8Array(randomBytes(8));
  const nonce = convert.uint8ArrayToBigInt(nonceBytes);
  const toSubAccount = buildSubAccount(nonceBytes, principal);

  const accountIdentifier = convert.principalToAccountIdentifier(
    GOVERNANCE_CANISTER_ID,
    toSubAccount
  );

  // Send amount to the ledger.
  const blockHeight = await ledgerService.sendICPTs({
    memo: nonce,
    amount: request.stake,
    to: accountIdentifier,
    fromSubAccountId: request.fromSubAccountId,
  });

      const outcome = await pollUntilComplete(
        nnsDappService,
        principal,
    blockHeight
      );

      if ("NeuronCreated" in outcome) {
        return outcome.NeuronCreated;
  } else {
    throw new Error("Unable to create neuron");
      }
}

// 32 bytes
function buildSubAccount(nonce: Uint8Array, principal: Principal): Uint8Array {
  const padding = convert.asciiStringToByteArray("neuron-stake");
  const shaObj = sha256.create();
  shaObj.update([0x0c, ...padding, ...principal.toUint8Array(), ...nonce]);
  return new Uint8Array(shaObj.array());
}
