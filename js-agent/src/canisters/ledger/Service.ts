import { Agent, Principal, QueryResponseStatus } from "@dfinity/agent";
import ServiceInterface, {
    AccountIdentifier,
    BlockHeight,
    Doms,
    GetBalancesRequest,
    NotifyCanisterRequest,
    SendICPTsRequest
} from "./model";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";
import { blobToUint8Array, uint8ArrayToBlob } from "../converter";
import { AccountBalanceResponse, SendResponse } from "./types/types_pb";
import { submitUpdateRequest } from "../updateRequestHandler";

export default class Service implements ServiceInterface {
    private readonly agent: Agent;
    private readonly canisterId: Principal;
    private readonly myPrincipal: Principal;
    private readonly requestConverters: RequestConverters;
    private readonly responseConverters: ResponseConverters;

    public constructor(agent: Agent, canisterId: Principal, myPrincipal: Principal) {
        this.agent = agent;
        this.canisterId = canisterId;
        this.myPrincipal = myPrincipal;
        this.requestConverters = new RequestConverters();
        this.responseConverters = new ResponseConverters();
    }

    public getBalances = async (request: GetBalancesRequest) : Promise<Record<AccountIdentifier, Doms>> => {
        const rawRequests = this.requestConverters.fromGetBalancesRequest(request);
        const promises = rawRequests.map(async r => {
            const rawResponse = await this.agent.query(this.canisterId, {
                methodName: "account_balance",
                arg: uint8ArrayToBlob(r.serializeBinary())
            });
            if (rawResponse.status === QueryResponseStatus.Replied) {
                const response = AccountBalanceResponse.deserializeBinary(blobToUint8Array(rawResponse.reply.arg));
                return this.responseConverters.toDoms(response);
            } else {
                throw new Error(`Code: {rawResponse.reject_code}. Message: {rawResponse.reject_message}`);
            }
        });
        const balances = await Promise.all(promises);

        const result = {};
        request.accounts.forEach((a, index) => {
            result[a] = balances[index];
        })
        return result;
    }

    public sendICPTs = async (request: SendICPTsRequest) : Promise<BlockHeight> => {
        const rawRequest = this.requestConverters.fromSendICPTsRequest(request);

        const responseBytes = await submitUpdateRequest(
            this.agent,
            this.canisterId,
            "send",
            uint8ArrayToBlob(rawRequest.serializeBinary()));

        const response = SendResponse.deserializeBinary(blobToUint8Array(responseBytes));
        return this.responseConverters.toBlockHeight(response);
    }

    public notify = async (request: NotifyCanisterRequest) : Promise<void> => {
        const rawRequest = this.requestConverters.fromNotifyCanisterRequest(request);

        await submitUpdateRequest(
            this.agent,
            this.canisterId,
            "notify",
            uint8ArrayToBlob(rawRequest.serializeBinary()));
    }
}
