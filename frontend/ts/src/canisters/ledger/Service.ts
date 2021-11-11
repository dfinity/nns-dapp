import async from "async";
import { Agent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier, BlockHeight, E8s } from "../common/types";
import ServiceInterface, {
  GetBalancesRequest,
  NotifyCanisterRequest,
  SendICPTsRequest,
} from "./model";
import RequestConverters from "./RequestConverters";
import { BlockHeight as BlockHeightProto, ICPTs } from "../../proto/ledger_pb";
import { submitQueryRequest } from "../queryRequestHandler";
import { submitUpdateRequest } from "../updateRequestHandler";

export default class Service implements ServiceInterface {
  private readonly agent: Agent;
  private readonly canisterId: Principal;
  private readonly requestConverters: RequestConverters;

  public constructor(agent: Agent, canisterId: Principal) {
    this.agent = agent;
    this.canisterId = canisterId;
    this.requestConverters = new RequestConverters();
  }

  public getBalances = async (
    request: GetBalancesRequest,
    certified = true
  ): Promise<Record<AccountIdentifier, E8s>> => {
    const rawRequests = this.requestConverters.fromGetBalancesRequest(request);

    const balances: Record<AccountIdentifier, E8s> = {};

    // TODO switch to getting multiple balances in a single request once it is supported by the ledger.
    // Until the above is supported we must limit the max concurrency otherwise our requests may be throttled.
    const maxConcurrency = 10;
    await async.eachOfLimit(rawRequests, maxConcurrency, async (r, i) => {
      const callMethod = certified ? submitUpdateRequest : submitQueryRequest;
      const responseBytes = await callMethod(
        this.agent,
        this.canisterId,
        "account_balance_pb",
        r.serializeBinary()
      );

      const accountIdentifier = request.accounts[i as number];
      balances[accountIdentifier] = BigInt(
        ICPTs.deserializeBinary(responseBytes).getE8s()
      );
    });

    return balances;
  };

  public sendICPTs = async (
    request: SendICPTsRequest
  ): Promise<BlockHeight> => {
    const rawRequest = this.requestConverters.fromSendICPTsRequest(request);

    const responseBytes = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "send_pb",
      rawRequest.serializeBinary()
    );

    return BigInt(
      BlockHeightProto.deserializeBinary(responseBytes).getHeight()
    );
  };

  public notify = async (
    request: NotifyCanisterRequest
  ): Promise<Uint8Array> => {
    const rawRequest =
      this.requestConverters.fromNotifyCanisterRequest(request);

    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "notify_pb",
      rawRequest.serializeBinary()
    );

    return rawResponse;
  };
}
