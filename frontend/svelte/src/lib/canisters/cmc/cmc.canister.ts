import { Actor } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { CMCCanisterOptions } from "./cmc.canister.types";
import { CYCLES_PER_XDR } from "./cmc.constants";
import { throwNotifyError } from "./cmc.errors";
import { idlFactory } from "./cmc.idl";
import type {
  Cycles,
  NotifyCreateCanisterArg,
  NotifyTopUpArg,
  _SERVICE,
} from "./cmc.types";

export class CMCCanister {
  private constructor(private readonly service: _SERVICE) {
    this.service = service;
  }

  public static create(options: CMCCanisterOptions) {
    const agent = options.agent;
    const canisterId = options.canisterId;

    const service =
      options.serviceOverride ??
      Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
      });

    return new CMCCanister(service);
  }

  /**
   * Returns conversion rate of ICP to Cycles
   *
   * @returns Promise<BigInt>
   */
  public getIcpToCyclesConversionRate = async (): Promise<bigint> => {
    const { data } = await this.service.get_icp_xdr_conversion_rate();

    // TODO: validate the certificate in the response - https://dfinity.atlassian.net/browse/FOLLOW-223
    return (data.xdr_permyriad_per_icp * CYCLES_PER_XDR) / BigInt(10_000);
  };

  /**
   * Notifies Cycles Minting Canister of the creation of a new canister.
   * It returns the new canister principal.
   *
   * @param {Object} request
   * @param {Principal} request.controller
   * @param {BlockIndex} request.block_index
   * @returns Promise<Principal>
   * @throws RefundedError, InvalidaTransactionError, ProcessingError, TransactionTooOldError, CMCError
   */
  public notifyCreateCanister = async (
    request: NotifyCreateCanisterArg
  ): Promise<Principal> => {
    const response = await this.service.notify_create_canister(request);
    if ("Err" in response) {
      throwNotifyError(response);
    }
    if ("Ok" in response) {
      return response.Ok;
    }
    // Edge case
    throw new Error(
      `Unsupported response type in notifyCreateCanister ${JSON.stringify(
        response
      )}`
    );
  };

  /**
   * Notifies Cycles Minting Canister of new cycles being added to canister.
   * It returns the new Cycles of the canister.
   *
   * @param {Object} request
   * @param {Principal} request.canister_id
   * @param {BlockIndex} request.block_index
   * @returns Promise<Cycles>
   * @throws RefundedError, InvalidaTransactionError, ProcessingError, TransactionTooOldError, CMCError
   */
  public notifyTopUp = async (request: NotifyTopUpArg): Promise<Cycles> => {
    const response = await this.service.notify_top_up(request);
    if ("Err" in response) {
      throwNotifyError(response);
    }
    if ("Ok" in response) {
      return response.Ok;
    }
    // Edge case
    throw new Error(
      `Unsupported response type in notifyTopUp ${JSON.stringify(response)}`
    );
  };
}
