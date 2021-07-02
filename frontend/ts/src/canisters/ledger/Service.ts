import { Agent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier, BlockHeight, E8s } from "../common/types";
import ServiceInterface, {
  GetBalancesRequest,
  NotifyCanisterRequest,
  SendICPTsRequest,
} from "./model";
import RequestConverters from "./RequestConverters";
import { BlockHeight as BlockHeightProto, ICPTs } from "./proto/types_pb";
import { submitQueryRequest } from "../queryRequestHandler";
import { submitUpdateRequest } from "../updateRequestHandler";

export default class Service implements ServiceInterface {
  private readonly agent: Agent;
  private readonly canisterId: Principal;
  private readonly myPrincipal: Principal;
  private readonly requestConverters: RequestConverters;

  public constructor(
    agent: Agent,
    canisterId: Principal,
    myPrincipal: Principal
  ) {
    this.agent = agent;
    this.canisterId = canisterId;
    this.myPrincipal = myPrincipal;
    this.requestConverters = new RequestConverters();
  }

  public getBalances = async (
    request: GetBalancesRequest
  ): Promise<Record<AccountIdentifier, E8s>> => {
    const rawRequests = this.requestConverters.fromGetBalancesRequest(request);
    const promises = rawRequests.map(async (r) => {
      const responseBytes = await submitQueryRequest(
        this.agent,
        this.canisterId,
        "account_balance_pb",
        r.serializeBinary()
      );

      return BigInt(ICPTs.deserializeBinary(responseBytes).getE8s());
    });
    const balances = await Promise.all(promises);

    const result: { [index: string]: bigint } = {};
    request.accounts.forEach((a, index) => {
      result[a] = balances[index];
    });
    return result;
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
