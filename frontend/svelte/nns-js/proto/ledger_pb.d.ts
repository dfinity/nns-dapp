// package: ic_ledger.pb.v1
// file: ledger.proto

import * as jspb from "google-protobuf";
import * as base_types_pb from "./base_types_pb";

export class SendRequest extends jspb.Message {
  hasMemo(): boolean;
  clearMemo(): void;
  getMemo(): Memo | undefined;
  setMemo(value?: Memo): void;

  hasPayment(): boolean;
  clearPayment(): void;
  getPayment(): Payment | undefined;
  setPayment(value?: Payment): void;

  hasMaxFee(): boolean;
  clearMaxFee(): void;
  getMaxFee(): ICPTs | undefined;
  setMaxFee(value?: ICPTs): void;

  hasFromSubaccount(): boolean;
  clearFromSubaccount(): void;
  getFromSubaccount(): Subaccount | undefined;
  setFromSubaccount(value?: Subaccount): void;

  hasTo(): boolean;
  clearTo(): void;
  getTo(): AccountIdentifier | undefined;
  setTo(value?: AccountIdentifier): void;

  hasCreatedAt(): boolean;
  clearCreatedAt(): void;
  getCreatedAt(): BlockHeight | undefined;
  setCreatedAt(value?: BlockHeight): void;

  hasCreatedAtTime(): boolean;
  clearCreatedAtTime(): void;
  getCreatedAtTime(): TimeStamp | undefined;
  setCreatedAtTime(value?: TimeStamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendRequest): SendRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendRequest;
  static deserializeBinaryFromReader(message: SendRequest, reader: jspb.BinaryReader): SendRequest;
}

export namespace SendRequest {
  export type AsObject = {
    memo?: Memo.AsObject,
    payment?: Payment.AsObject,
    maxFee?: ICPTs.AsObject,
    fromSubaccount?: Subaccount.AsObject,
    to?: AccountIdentifier.AsObject,
    createdAt?: BlockHeight.AsObject,
    createdAtTime?: TimeStamp.AsObject,
  }
}

export class SendResponse extends jspb.Message {
  hasResultingHeight(): boolean;
  clearResultingHeight(): void;
  getResultingHeight(): BlockHeight | undefined;
  setResultingHeight(value?: BlockHeight): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendResponse): SendResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendResponse;
  static deserializeBinaryFromReader(message: SendResponse, reader: jspb.BinaryReader): SendResponse;
}

export namespace SendResponse {
  export type AsObject = {
    resultingHeight?: BlockHeight.AsObject,
  }
}

export class NotifyRequest extends jspb.Message {
  hasBlockHeight(): boolean;
  clearBlockHeight(): void;
  getBlockHeight(): BlockHeight | undefined;
  setBlockHeight(value?: BlockHeight): void;

  hasMaxFee(): boolean;
  clearMaxFee(): void;
  getMaxFee(): ICPTs | undefined;
  setMaxFee(value?: ICPTs): void;

  hasFromSubaccount(): boolean;
  clearFromSubaccount(): void;
  getFromSubaccount(): Subaccount | undefined;
  setFromSubaccount(value?: Subaccount): void;

  hasToCanister(): boolean;
  clearToCanister(): void;
  getToCanister(): base_types_pb.PrincipalId | undefined;
  setToCanister(value?: base_types_pb.PrincipalId): void;

  hasToSubaccount(): boolean;
  clearToSubaccount(): void;
  getToSubaccount(): Subaccount | undefined;
  setToSubaccount(value?: Subaccount): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NotifyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NotifyRequest): NotifyRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NotifyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NotifyRequest;
  static deserializeBinaryFromReader(message: NotifyRequest, reader: jspb.BinaryReader): NotifyRequest;
}

export namespace NotifyRequest {
  export type AsObject = {
    blockHeight?: BlockHeight.AsObject,
    maxFee?: ICPTs.AsObject,
    fromSubaccount?: Subaccount.AsObject,
    toCanister?: base_types_pb.PrincipalId.AsObject,
    toSubaccount?: Subaccount.AsObject,
  }
}

export class NotifyResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NotifyResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NotifyResponse): NotifyResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NotifyResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NotifyResponse;
  static deserializeBinaryFromReader(message: NotifyResponse, reader: jspb.BinaryReader): NotifyResponse;
}

export namespace NotifyResponse {
  export type AsObject = {
  }
}

export class TransactionNotificationRequest extends jspb.Message {
  hasFrom(): boolean;
  clearFrom(): void;
  getFrom(): base_types_pb.PrincipalId | undefined;
  setFrom(value?: base_types_pb.PrincipalId): void;

  hasFromSubaccount(): boolean;
  clearFromSubaccount(): void;
  getFromSubaccount(): Subaccount | undefined;
  setFromSubaccount(value?: Subaccount): void;

  hasTo(): boolean;
  clearTo(): void;
  getTo(): base_types_pb.PrincipalId | undefined;
  setTo(value?: base_types_pb.PrincipalId): void;

  hasToSubaccount(): boolean;
  clearToSubaccount(): void;
  getToSubaccount(): Subaccount | undefined;
  setToSubaccount(value?: Subaccount): void;

  hasBlockHeight(): boolean;
  clearBlockHeight(): void;
  getBlockHeight(): BlockHeight | undefined;
  setBlockHeight(value?: BlockHeight): void;

  hasAmount(): boolean;
  clearAmount(): void;
  getAmount(): ICPTs | undefined;
  setAmount(value?: ICPTs): void;

  hasMemo(): boolean;
  clearMemo(): void;
  getMemo(): Memo | undefined;
  setMemo(value?: Memo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionNotificationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionNotificationRequest): TransactionNotificationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TransactionNotificationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionNotificationRequest;
  static deserializeBinaryFromReader(message: TransactionNotificationRequest, reader: jspb.BinaryReader): TransactionNotificationRequest;
}

export namespace TransactionNotificationRequest {
  export type AsObject = {
    from?: base_types_pb.PrincipalId.AsObject,
    fromSubaccount?: Subaccount.AsObject,
    to?: base_types_pb.PrincipalId.AsObject,
    toSubaccount?: Subaccount.AsObject,
    blockHeight?: BlockHeight.AsObject,
    amount?: ICPTs.AsObject,
    memo?: Memo.AsObject,
  }
}

export class TransactionNotificationResponse extends jspb.Message {
  getResponse(): Uint8Array | string;
  getResponse_asU8(): Uint8Array;
  getResponse_asB64(): string;
  setResponse(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionNotificationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionNotificationResponse): TransactionNotificationResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TransactionNotificationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionNotificationResponse;
  static deserializeBinaryFromReader(message: TransactionNotificationResponse, reader: jspb.BinaryReader): TransactionNotificationResponse;
}

export namespace TransactionNotificationResponse {
  export type AsObject = {
    response: Uint8Array | string,
  }
}

export class CyclesNotificationResponse extends jspb.Message {
  hasCreatedCanisterId(): boolean;
  clearCreatedCanisterId(): void;
  getCreatedCanisterId(): base_types_pb.PrincipalId | undefined;
  setCreatedCanisterId(value?: base_types_pb.PrincipalId): void;

  hasRefund(): boolean;
  clearRefund(): void;
  getRefund(): Refund | undefined;
  setRefund(value?: Refund): void;

  hasToppedUp(): boolean;
  clearToppedUp(): void;
  getToppedUp(): ToppedUp | undefined;
  setToppedUp(value?: ToppedUp): void;

  getResponseCase(): CyclesNotificationResponse.ResponseCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CyclesNotificationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CyclesNotificationResponse): CyclesNotificationResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CyclesNotificationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CyclesNotificationResponse;
  static deserializeBinaryFromReader(message: CyclesNotificationResponse, reader: jspb.BinaryReader): CyclesNotificationResponse;
}

export namespace CyclesNotificationResponse {
  export type AsObject = {
    createdCanisterId?: base_types_pb.PrincipalId.AsObject,
    refund?: Refund.AsObject,
    toppedUp?: ToppedUp.AsObject,
  }

  export enum ResponseCase {
    RESPONSE_NOT_SET = 0,
    CREATED_CANISTER_ID = 1,
    REFUND = 2,
    TOPPED_UP = 3,
  }
}

export class AccountBalanceRequest extends jspb.Message {
  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): AccountIdentifier | undefined;
  setAccount(value?: AccountIdentifier): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountBalanceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AccountBalanceRequest): AccountBalanceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountBalanceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountBalanceRequest;
  static deserializeBinaryFromReader(message: AccountBalanceRequest, reader: jspb.BinaryReader): AccountBalanceRequest;
}

export namespace AccountBalanceRequest {
  export type AsObject = {
    account?: AccountIdentifier.AsObject,
  }
}

export class AccountBalanceResponse extends jspb.Message {
  hasBalance(): boolean;
  clearBalance(): void;
  getBalance(): ICPTs | undefined;
  setBalance(value?: ICPTs): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountBalanceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AccountBalanceResponse): AccountBalanceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountBalanceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountBalanceResponse;
  static deserializeBinaryFromReader(message: AccountBalanceResponse, reader: jspb.BinaryReader): AccountBalanceResponse;
}

export namespace AccountBalanceResponse {
  export type AsObject = {
    balance?: ICPTs.AsObject,
  }
}

export class TipOfChainRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TipOfChainRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TipOfChainRequest): TipOfChainRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TipOfChainRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TipOfChainRequest;
  static deserializeBinaryFromReader(message: TipOfChainRequest, reader: jspb.BinaryReader): TipOfChainRequest;
}

export namespace TipOfChainRequest {
  export type AsObject = {
  }
}

export class TipOfChainResponse extends jspb.Message {
  hasCertification(): boolean;
  clearCertification(): void;
  getCertification(): Certification | undefined;
  setCertification(value?: Certification): void;

  hasChainLength(): boolean;
  clearChainLength(): void;
  getChainLength(): BlockHeight | undefined;
  setChainLength(value?: BlockHeight): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TipOfChainResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TipOfChainResponse): TipOfChainResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TipOfChainResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TipOfChainResponse;
  static deserializeBinaryFromReader(message: TipOfChainResponse, reader: jspb.BinaryReader): TipOfChainResponse;
}

export namespace TipOfChainResponse {
  export type AsObject = {
    certification?: Certification.AsObject,
    chainLength?: BlockHeight.AsObject,
  }
}

export class EncodedBlock extends jspb.Message {
  getBlock(): Uint8Array | string;
  getBlock_asU8(): Uint8Array;
  getBlock_asB64(): string;
  setBlock(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EncodedBlock.AsObject;
  static toObject(includeInstance: boolean, msg: EncodedBlock): EncodedBlock.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EncodedBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EncodedBlock;
  static deserializeBinaryFromReader(message: EncodedBlock, reader: jspb.BinaryReader): EncodedBlock;
}

export namespace EncodedBlock {
  export type AsObject = {
    block: Uint8Array | string,
  }
}

export class GetBlocksRequest extends jspb.Message {
  getStart(): string;
  setStart(value: string): void;

  getLength(): string;
  setLength(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlocksRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlocksRequest): GetBlocksRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetBlocksRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlocksRequest;
  static deserializeBinaryFromReader(message: GetBlocksRequest, reader: jspb.BinaryReader): GetBlocksRequest;
}

export namespace GetBlocksRequest {
  export type AsObject = {
    start: string,
    length: string,
  }
}

export class Refund extends jspb.Message {
  hasRefund(): boolean;
  clearRefund(): void;
  getRefund(): BlockHeight | undefined;
  setRefund(value?: BlockHeight): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Refund.AsObject;
  static toObject(includeInstance: boolean, msg: Refund): Refund.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Refund, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Refund;
  static deserializeBinaryFromReader(message: Refund, reader: jspb.BinaryReader): Refund;
}

export namespace Refund {
  export type AsObject = {
    refund?: BlockHeight.AsObject,
    error: string,
  }
}

export class ToppedUp extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToppedUp.AsObject;
  static toObject(includeInstance: boolean, msg: ToppedUp): ToppedUp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ToppedUp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToppedUp;
  static deserializeBinaryFromReader(message: ToppedUp, reader: jspb.BinaryReader): ToppedUp;
}

export namespace ToppedUp {
  export type AsObject = {
  }
}

export class EncodedBlocks extends jspb.Message {
  clearBlocksList(): void;
  getBlocksList(): Array<EncodedBlock>;
  setBlocksList(value: Array<EncodedBlock>): void;
  addBlocks(value?: EncodedBlock, index?: number): EncodedBlock;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EncodedBlocks.AsObject;
  static toObject(includeInstance: boolean, msg: EncodedBlocks): EncodedBlocks.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EncodedBlocks, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EncodedBlocks;
  static deserializeBinaryFromReader(message: EncodedBlocks, reader: jspb.BinaryReader): EncodedBlocks;
}

export namespace EncodedBlocks {
  export type AsObject = {
    blocksList: Array<EncodedBlock.AsObject>,
  }
}

export class GetBlocksResponse extends jspb.Message {
  hasBlocks(): boolean;
  clearBlocks(): void;
  getBlocks(): EncodedBlocks | undefined;
  setBlocks(value?: EncodedBlocks): void;

  hasError(): boolean;
  clearError(): void;
  getError(): string;
  setError(value: string): void;

  getGetBlocksContentCase(): GetBlocksResponse.GetBlocksContentCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlocksResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlocksResponse): GetBlocksResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetBlocksResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlocksResponse;
  static deserializeBinaryFromReader(message: GetBlocksResponse, reader: jspb.BinaryReader): GetBlocksResponse;
}

export namespace GetBlocksResponse {
  export type AsObject = {
    blocks?: EncodedBlocks.AsObject,
    error: string,
  }

  export enum GetBlocksContentCase {
    GET_BLOCKS_CONTENT_NOT_SET = 0,
    BLOCKS = 1,
    ERROR = 2,
  }
}

export class ICPTs extends jspb.Message {
  getE8s(): string;
  setE8s(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ICPTs.AsObject;
  static toObject(includeInstance: boolean, msg: ICPTs): ICPTs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ICPTs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ICPTs;
  static deserializeBinaryFromReader(message: ICPTs, reader: jspb.BinaryReader): ICPTs;
}

export namespace ICPTs {
  export type AsObject = {
    e8s: string,
  }
}

export class Payment extends jspb.Message {
  hasReceiverGets(): boolean;
  clearReceiverGets(): void;
  getReceiverGets(): ICPTs | undefined;
  setReceiverGets(value?: ICPTs): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Payment.AsObject;
  static toObject(includeInstance: boolean, msg: Payment): Payment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Payment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Payment;
  static deserializeBinaryFromReader(message: Payment, reader: jspb.BinaryReader): Payment;
}

export namespace Payment {
  export type AsObject = {
    receiverGets?: ICPTs.AsObject,
  }
}

export class BlockHeight extends jspb.Message {
  getHeight(): string;
  setHeight(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockHeight.AsObject;
  static toObject(includeInstance: boolean, msg: BlockHeight): BlockHeight.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlockHeight, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockHeight;
  static deserializeBinaryFromReader(message: BlockHeight, reader: jspb.BinaryReader): BlockHeight;
}

export namespace BlockHeight {
  export type AsObject = {
    height: string,
  }
}

export class Block extends jspb.Message {
  hasParentHash(): boolean;
  clearParentHash(): void;
  getParentHash(): Hash | undefined;
  setParentHash(value?: Hash): void;

  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): TimeStamp | undefined;
  setTimestamp(value?: TimeStamp): void;

  hasTransaction(): boolean;
  clearTransaction(): void;
  getTransaction(): Transaction | undefined;
  setTransaction(value?: Transaction): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Block.AsObject;
  static toObject(includeInstance: boolean, msg: Block): Block.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Block, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Block;
  static deserializeBinaryFromReader(message: Block, reader: jspb.BinaryReader): Block;
}

export namespace Block {
  export type AsObject = {
    parentHash?: Hash.AsObject,
    timestamp?: TimeStamp.AsObject,
    transaction?: Transaction.AsObject,
  }
}

export class Hash extends jspb.Message {
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Hash.AsObject;
  static toObject(includeInstance: boolean, msg: Hash): Hash.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Hash, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Hash;
  static deserializeBinaryFromReader(message: Hash, reader: jspb.BinaryReader): Hash;
}

export namespace Hash {
  export type AsObject = {
    hash: Uint8Array | string,
  }
}

export class Account extends jspb.Message {
  hasIdentifier(): boolean;
  clearIdentifier(): void;
  getIdentifier(): AccountIdentifier | undefined;
  setIdentifier(value?: AccountIdentifier): void;

  hasBalance(): boolean;
  clearBalance(): void;
  getBalance(): ICPTs | undefined;
  setBalance(value?: ICPTs): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Account.AsObject;
  static toObject(includeInstance: boolean, msg: Account): Account.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Account, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Account;
  static deserializeBinaryFromReader(message: Account, reader: jspb.BinaryReader): Account;
}

export namespace Account {
  export type AsObject = {
    identifier?: AccountIdentifier.AsObject,
    balance?: ICPTs.AsObject,
  }
}

export class Transaction extends jspb.Message {
  hasBurn(): boolean;
  clearBurn(): void;
  getBurn(): Burn | undefined;
  setBurn(value?: Burn): void;

  hasMint(): boolean;
  clearMint(): void;
  getMint(): Mint | undefined;
  setMint(value?: Mint): void;

  hasSend(): boolean;
  clearSend(): void;
  getSend(): Send | undefined;
  setSend(value?: Send): void;

  hasMemo(): boolean;
  clearMemo(): void;
  getMemo(): Memo | undefined;
  setMemo(value?: Memo): void;

  hasCreatedAt(): boolean;
  clearCreatedAt(): void;
  getCreatedAt(): BlockHeight | undefined;
  setCreatedAt(value?: BlockHeight): void;

  hasCreatedAtTime(): boolean;
  clearCreatedAtTime(): void;
  getCreatedAtTime(): TimeStamp | undefined;
  setCreatedAtTime(value?: TimeStamp): void;

  getTransferCase(): Transaction.TransferCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Transaction.AsObject;
  static toObject(includeInstance: boolean, msg: Transaction): Transaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Transaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Transaction;
  static deserializeBinaryFromReader(message: Transaction, reader: jspb.BinaryReader): Transaction;
}

export namespace Transaction {
  export type AsObject = {
    burn?: Burn.AsObject,
    mint?: Mint.AsObject,
    send?: Send.AsObject,
    memo?: Memo.AsObject,
    createdAt?: BlockHeight.AsObject,
    createdAtTime?: TimeStamp.AsObject,
  }

  export enum TransferCase {
    TRANSFER_NOT_SET = 0,
    BURN = 1,
    MINT = 2,
    SEND = 3,
  }
}

export class Send extends jspb.Message {
  hasFrom(): boolean;
  clearFrom(): void;
  getFrom(): AccountIdentifier | undefined;
  setFrom(value?: AccountIdentifier): void;

  hasTo(): boolean;
  clearTo(): void;
  getTo(): AccountIdentifier | undefined;
  setTo(value?: AccountIdentifier): void;

  hasAmount(): boolean;
  clearAmount(): void;
  getAmount(): ICPTs | undefined;
  setAmount(value?: ICPTs): void;

  hasMaxFee(): boolean;
  clearMaxFee(): void;
  getMaxFee(): ICPTs | undefined;
  setMaxFee(value?: ICPTs): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Send.AsObject;
  static toObject(includeInstance: boolean, msg: Send): Send.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Send, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Send;
  static deserializeBinaryFromReader(message: Send, reader: jspb.BinaryReader): Send;
}

export namespace Send {
  export type AsObject = {
    from?: AccountIdentifier.AsObject,
    to?: AccountIdentifier.AsObject,
    amount?: ICPTs.AsObject,
    maxFee?: ICPTs.AsObject,
  }
}

export class Mint extends jspb.Message {
  hasTo(): boolean;
  clearTo(): void;
  getTo(): AccountIdentifier | undefined;
  setTo(value?: AccountIdentifier): void;

  hasAmount(): boolean;
  clearAmount(): void;
  getAmount(): ICPTs | undefined;
  setAmount(value?: ICPTs): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Mint.AsObject;
  static toObject(includeInstance: boolean, msg: Mint): Mint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Mint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Mint;
  static deserializeBinaryFromReader(message: Mint, reader: jspb.BinaryReader): Mint;
}

export namespace Mint {
  export type AsObject = {
    to?: AccountIdentifier.AsObject,
    amount?: ICPTs.AsObject,
  }
}

export class Burn extends jspb.Message {
  hasFrom(): boolean;
  clearFrom(): void;
  getFrom(): AccountIdentifier | undefined;
  setFrom(value?: AccountIdentifier): void;

  hasAmount(): boolean;
  clearAmount(): void;
  getAmount(): ICPTs | undefined;
  setAmount(value?: ICPTs): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Burn.AsObject;
  static toObject(includeInstance: boolean, msg: Burn): Burn.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Burn, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Burn;
  static deserializeBinaryFromReader(message: Burn, reader: jspb.BinaryReader): Burn;
}

export namespace Burn {
  export type AsObject = {
    from?: AccountIdentifier.AsObject,
    amount?: ICPTs.AsObject,
  }
}

export class AccountIdentifier extends jspb.Message {
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountIdentifier.AsObject;
  static toObject(includeInstance: boolean, msg: AccountIdentifier): AccountIdentifier.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountIdentifier, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountIdentifier;
  static deserializeBinaryFromReader(message: AccountIdentifier, reader: jspb.BinaryReader): AccountIdentifier;
}

export namespace AccountIdentifier {
  export type AsObject = {
    hash: Uint8Array | string,
  }
}

export class Subaccount extends jspb.Message {
  getSubAccount(): Uint8Array | string;
  getSubAccount_asU8(): Uint8Array;
  getSubAccount_asB64(): string;
  setSubAccount(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Subaccount.AsObject;
  static toObject(includeInstance: boolean, msg: Subaccount): Subaccount.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Subaccount, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Subaccount;
  static deserializeBinaryFromReader(message: Subaccount, reader: jspb.BinaryReader): Subaccount;
}

export namespace Subaccount {
  export type AsObject = {
    subAccount: Uint8Array | string,
  }
}

export class Memo extends jspb.Message {
  getMemo(): string;
  setMemo(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Memo.AsObject;
  static toObject(includeInstance: boolean, msg: Memo): Memo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Memo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Memo;
  static deserializeBinaryFromReader(message: Memo, reader: jspb.BinaryReader): Memo;
}

export namespace Memo {
  export type AsObject = {
    memo: string,
  }
}

export class TimeStamp extends jspb.Message {
  getTimestampNanos(): string;
  setTimestampNanos(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TimeStamp.AsObject;
  static toObject(includeInstance: boolean, msg: TimeStamp): TimeStamp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TimeStamp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TimeStamp;
  static deserializeBinaryFromReader(message: TimeStamp, reader: jspb.BinaryReader): TimeStamp;
}

export namespace TimeStamp {
  export type AsObject = {
    timestampNanos: string,
  }
}

export class Certification extends jspb.Message {
  getCertification(): Uint8Array | string;
  getCertification_asU8(): Uint8Array;
  getCertification_asB64(): string;
  setCertification(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Certification.AsObject;
  static toObject(includeInstance: boolean, msg: Certification): Certification.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Certification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Certification;
  static deserializeBinaryFromReader(message: Certification, reader: jspb.BinaryReader): Certification;
}

export namespace Certification {
  export type AsObject = {
    certification: Uint8Array | string,
  }
}

