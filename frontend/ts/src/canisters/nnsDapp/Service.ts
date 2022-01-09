import { Principal } from "@dfinity/principal";
import { AccountIdentifier, BlockHeight } from "../common/types";
import ServiceInterface, {
  AttachCanisterRequest,
  AttachCanisterResult,
  CanisterDetails,
  CreateSubAccountResponse,
  DetachCanisterRequest,
  DetachCanisterResponse,
  GetAccountResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  MultiPartTransactionStatus,
  NamedNeuron,
  RegisterHardwareWalletRequest,
  RegisterHardwareWalletResponse,
  RenameSubAccountRequest,
  RenameSubAccountResponse,
} from "./model";
import { _SERVICE } from "./rawService";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";

export default class Service implements ServiceInterface {
  private readonly service: _SERVICE;
  private readonly certifiedService: _SERVICE;
  private requestConverters: RequestConverters;
  private responseConverters: ResponseConverters;

  public constructor(service: _SERVICE, serviceCertified: _SERVICE) {
    this.service = service;
    this.certifiedService = serviceCertified;
    this.requestConverters = new RequestConverters();
    this.responseConverters = new ResponseConverters();
  }

  public attachCanister = async (
    request: AttachCanisterRequest
  ): Promise<AttachCanisterResult> => {
    const rawRequest =
      this.requestConverters.fromAttachCanisterRequest(request);
    const rawResponse = await this.service.attach_canister(rawRequest);
    return this.responseConverters.toAttachCanisterResponse(rawResponse);
  };

  public detachCanister = async (
    request: DetachCanisterRequest
  ): Promise<DetachCanisterResponse> => {
    const rawRequest =
      this.requestConverters.fromDetachCanisterRequest(request);
    const rawResponse = await this.service.detach_canister(rawRequest);
    return this.responseConverters.toDetachCanisterResponse(rawResponse);
  };

  public getCanisters = async (
    certified = true
  ): Promise<Array<CanisterDetails>> => {
    const serviceToUse = certified ? this.certifiedService : this.service;
    const rawResponse = await serviceToUse.get_canisters();
    return this.responseConverters.toArrayOfCanisterDetail(rawResponse);
  };

  public getAccount = async (certified = true): Promise<GetAccountResponse> => {
    const serviceToUse = certified ? this.certifiedService : this.service;
    const rawResponse = await serviceToUse.get_account();
    return this.responseConverters.toGetAccountResponse(rawResponse);
  };

  public addAccount = (): Promise<AccountIdentifier> => {
    return this.service.add_account();
  };

  public createSubAccount = async (
    name: string
  ): Promise<CreateSubAccountResponse> => {
    const rawResponse = await this.service.create_sub_account(name);
    return this.responseConverters.toCreateSubAccountResponse(rawResponse);
  };

  public renameSubAccount = async (
    request: RenameSubAccountRequest
  ): Promise<RenameSubAccountResponse> => {
    const rawRequest =
      this.requestConverters.fromRenameSubAccountRequest(request);
    const rawResponse = await this.service.rename_sub_account(rawRequest);
    return this.responseConverters.toRenameSubAccountResponse(rawResponse);
  };

  public registerHardwareWallet = async (
    request: RegisterHardwareWalletRequest
  ): Promise<RegisterHardwareWalletResponse> => {
    const rawRequest =
      this.requestConverters.fromRegisterHardwareWalletRequest(request);
    const rawResponse = await this.service.register_hardware_wallet(rawRequest);
    return this.responseConverters.toRegisterHardwareWalletResponse(
      rawResponse
    );
  };

  public getTransactions = async (
    request: GetTransactionsRequest,
    certified: boolean
  ): Promise<GetTransactionsResponse> => {
    const rawRequest =
      this.requestConverters.fromGetTransactionsRequest(request);
    const serviceToUse = certified ? this.certifiedService : this.service;
    const rawResponse = await serviceToUse.get_transactions(rawRequest);
    return this.responseConverters.toGetTransactionsResponse(rawResponse);
  };

  public getMultiPartTransactionStatus = async (
    principal: Principal,
    blockHeight: BlockHeight
  ): Promise<MultiPartTransactionStatus> => {
    const rawResponse = await this.service.get_multi_part_transaction_status(
      principal,
      blockHeight
    );
    return this.responseConverters.toMultiPartTransactionStatus(rawResponse);
  };

  public followeeSuggestions = (certified: boolean): Promise<Array<NamedNeuron>> => {
    return certified
        ? this.certifiedService.followee_suggestions()
        : this.service.followee_suggestions();
  }
}
