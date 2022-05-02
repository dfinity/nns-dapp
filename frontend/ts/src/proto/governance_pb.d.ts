// package: ic_nns_governance.pb.v1
// file: governance.proto

import * as jspb from "google-protobuf";
import * as base_types_pb from "./base_types_pb";
import * as ledger_pb from "./ledger_pb";

export class ManageNeuron extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): base_types_pb.NeuronId | undefined;
  setId(value?: base_types_pb.NeuronId): void;

  hasSubaccount(): boolean;
  clearSubaccount(): void;
  getSubaccount(): Uint8Array | string;
  getSubaccount_asU8(): Uint8Array;
  getSubaccount_asB64(): string;
  setSubaccount(value: Uint8Array | string): void;

  hasNeuronId(): boolean;
  clearNeuronId(): void;
  getNeuronId(): base_types_pb.NeuronId | undefined;
  setNeuronId(value?: base_types_pb.NeuronId): void;

  hasConfigure(): boolean;
  clearConfigure(): void;
  getConfigure(): ManageNeuron.Configure | undefined;
  setConfigure(value?: ManageNeuron.Configure): void;

  hasDisburse(): boolean;
  clearDisburse(): void;
  getDisburse(): ManageNeuron.Disburse | undefined;
  setDisburse(value?: ManageNeuron.Disburse): void;

  hasSpawn(): boolean;
  clearSpawn(): void;
  getSpawn(): ManageNeuron.Spawn | undefined;
  setSpawn(value?: ManageNeuron.Spawn): void;

  hasFollow(): boolean;
  clearFollow(): void;
  getFollow(): ManageNeuron.Follow | undefined;
  setFollow(value?: ManageNeuron.Follow): void;

  hasRegisterVote(): boolean;
  clearRegisterVote(): void;
  getRegisterVote(): ManageNeuron.RegisterVote | undefined;
  setRegisterVote(value?: ManageNeuron.RegisterVote): void;

  hasMergeMaturity(): boolean;
  clearMergeMaturity(): void;
  getMergeMaturity(): ManageNeuron.MergeMaturity | undefined;
  setMergeMaturity(value?: ManageNeuron.MergeMaturity): void;

  hasMerge(): boolean;
  clearMerge(): void;
  getMerge(): ManageNeuron.Merge | undefined;
  setMerge(value?: ManageNeuron.Merge): void;

  getNeuronIdOrSubaccountCase(): ManageNeuron.NeuronIdOrSubaccountCase;
  getCommandCase(): ManageNeuron.CommandCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ManageNeuron.AsObject;
  static toObject(includeInstance: boolean, msg: ManageNeuron): ManageNeuron.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ManageNeuron, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ManageNeuron;
  static deserializeBinaryFromReader(message: ManageNeuron, reader: jspb.BinaryReader): ManageNeuron;
}

export namespace ManageNeuron {
  export type AsObject = {
    id?: base_types_pb.NeuronId.AsObject,
    subaccount: Uint8Array | string,
    neuronId?: base_types_pb.NeuronId.AsObject,
    configure?: ManageNeuron.Configure.AsObject,
    disburse?: ManageNeuron.Disburse.AsObject,
    spawn?: ManageNeuron.Spawn.AsObject,
    follow?: ManageNeuron.Follow.AsObject,
    registerVote?: ManageNeuron.RegisterVote.AsObject,
    mergeMaturity?: ManageNeuron.MergeMaturity.AsObject,
    merge?: ManageNeuron.Merge.AsObject,
  }

  export class IncreaseDissolveDelay extends jspb.Message {
    getAdditionalDissolveDelaySeconds(): number;
    setAdditionalDissolveDelaySeconds(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): IncreaseDissolveDelay.AsObject;
    static toObject(includeInstance: boolean, msg: IncreaseDissolveDelay): IncreaseDissolveDelay.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: IncreaseDissolveDelay, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): IncreaseDissolveDelay;
    static deserializeBinaryFromReader(message: IncreaseDissolveDelay, reader: jspb.BinaryReader): IncreaseDissolveDelay;
  }

  export namespace IncreaseDissolveDelay {
    export type AsObject = {
      additionalDissolveDelaySeconds: number,
    }
  }

  export class StartDissolving extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StartDissolving.AsObject;
    static toObject(includeInstance: boolean, msg: StartDissolving): StartDissolving.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StartDissolving, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StartDissolving;
    static deserializeBinaryFromReader(message: StartDissolving, reader: jspb.BinaryReader): StartDissolving;
  }

  export namespace StartDissolving {
    export type AsObject = {
    }
  }

  export class StopDissolving extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StopDissolving.AsObject;
    static toObject(includeInstance: boolean, msg: StopDissolving): StopDissolving.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StopDissolving, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StopDissolving;
    static deserializeBinaryFromReader(message: StopDissolving, reader: jspb.BinaryReader): StopDissolving;
  }

  export namespace StopDissolving {
    export type AsObject = {
    }
  }

  export class AddHotKey extends jspb.Message {
    hasNewHotKey(): boolean;
    clearNewHotKey(): void;
    getNewHotKey(): base_types_pb.PrincipalId | undefined;
    setNewHotKey(value?: base_types_pb.PrincipalId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AddHotKey.AsObject;
    static toObject(includeInstance: boolean, msg: AddHotKey): AddHotKey.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AddHotKey, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AddHotKey;
    static deserializeBinaryFromReader(message: AddHotKey, reader: jspb.BinaryReader): AddHotKey;
  }

  export namespace AddHotKey {
    export type AsObject = {
      newHotKey?: base_types_pb.PrincipalId.AsObject,
    }
  }

  export class RemoveHotKey extends jspb.Message {
    hasHotKeyToRemove(): boolean;
    clearHotKeyToRemove(): void;
    getHotKeyToRemove(): base_types_pb.PrincipalId | undefined;
    setHotKeyToRemove(value?: base_types_pb.PrincipalId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RemoveHotKey.AsObject;
    static toObject(includeInstance: boolean, msg: RemoveHotKey): RemoveHotKey.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RemoveHotKey, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RemoveHotKey;
    static deserializeBinaryFromReader(message: RemoveHotKey, reader: jspb.BinaryReader): RemoveHotKey;
  }

  export namespace RemoveHotKey {
    export type AsObject = {
      hotKeyToRemove?: base_types_pb.PrincipalId.AsObject,
    }
  }

  export class Configure extends jspb.Message {
    hasIncreaseDissolveDelay(): boolean;
    clearIncreaseDissolveDelay(): void;
    getIncreaseDissolveDelay(): ManageNeuron.IncreaseDissolveDelay | undefined;
    setIncreaseDissolveDelay(value?: ManageNeuron.IncreaseDissolveDelay): void;

    hasStartDissolving(): boolean;
    clearStartDissolving(): void;
    getStartDissolving(): ManageNeuron.StartDissolving | undefined;
    setStartDissolving(value?: ManageNeuron.StartDissolving): void;

    hasStopDissolving(): boolean;
    clearStopDissolving(): void;
    getStopDissolving(): ManageNeuron.StopDissolving | undefined;
    setStopDissolving(value?: ManageNeuron.StopDissolving): void;

    hasAddHotKey(): boolean;
    clearAddHotKey(): void;
    getAddHotKey(): ManageNeuron.AddHotKey | undefined;
    setAddHotKey(value?: ManageNeuron.AddHotKey): void;

    hasRemoveHotKey(): boolean;
    clearRemoveHotKey(): void;
    getRemoveHotKey(): ManageNeuron.RemoveHotKey | undefined;
    setRemoveHotKey(value?: ManageNeuron.RemoveHotKey): void;

    hasJoinCommunityFund(): boolean;
    clearJoinCommunityFund(): void;
    getJoinCommunityFund(): ManageNeuron.JoinCommunityFund | undefined;
    setJoinCommunityFund(value?: ManageNeuron.JoinCommunityFund): void;

    getOperationCase(): Configure.OperationCase;
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Configure.AsObject;
    static toObject(includeInstance: boolean, msg: Configure): Configure.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Configure, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Configure;
    static deserializeBinaryFromReader(message: Configure, reader: jspb.BinaryReader): Configure;
  }

  export namespace Configure {
    export type AsObject = {
      increaseDissolveDelay?: ManageNeuron.IncreaseDissolveDelay.AsObject,
      startDissolving?: ManageNeuron.StartDissolving.AsObject,
      stopDissolving?: ManageNeuron.StopDissolving.AsObject,
      addHotKey?: ManageNeuron.AddHotKey.AsObject,
      removeHotKey?: ManageNeuron.RemoveHotKey.AsObject,
      joinCommunityFund?: ManageNeuron.JoinCommunityFund.AsObject,
    }

    export enum OperationCase {
      OPERATION_NOT_SET = 0,
      INCREASE_DISSOLVE_DELAY = 1,
      START_DISSOLVING = 2,
      STOP_DISSOLVING = 3,
      ADD_HOT_KEY = 4,
      REMOVE_HOT_KEY = 5,
      JOIN_COMMUNITY_FUND = 7,
    }
  }

  export class Spawn extends jspb.Message {
    hasNewController(): boolean;
    clearNewController(): void;
    getNewController(): base_types_pb.PrincipalId | undefined;
    setNewController(value?: base_types_pb.PrincipalId): void;

    hasNonce(): boolean;
    clearNonce(): void;
    getNonce(): number;
    setNonce(value: number): void;

    hasPercentageToSpawn(): boolean;
    clearPercentageToSpawn(): void;
    getPercentageToSpawn(): number;
    setPercentageToSpawn(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Spawn.AsObject;
    static toObject(includeInstance: boolean, msg: Spawn): Spawn.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Spawn, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Spawn;
    static deserializeBinaryFromReader(message: Spawn, reader: jspb.BinaryReader): Spawn;
  }

  export namespace Spawn {
    export type AsObject = {
      newController?: base_types_pb.PrincipalId.AsObject,
      nonce: number,
      percentageToSpawn: number,
    }
  }

  export class Disburse extends jspb.Message {
    hasAmount(): boolean;
    clearAmount(): void;
    getAmount(): ManageNeuron.Disburse.Amount | undefined;
    setAmount(value?: ManageNeuron.Disburse.Amount): void;

    hasToAccount(): boolean;
    clearToAccount(): void;
    getToAccount(): ledger_pb.AccountIdentifier | undefined;
    setToAccount(value?: ledger_pb.AccountIdentifier): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Disburse.AsObject;
    static toObject(includeInstance: boolean, msg: Disburse): Disburse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Disburse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Disburse;
    static deserializeBinaryFromReader(message: Disburse, reader: jspb.BinaryReader): Disburse;
  }

  export namespace Disburse {
    export type AsObject = {
      amount?: ManageNeuron.Disburse.Amount.AsObject,
      toAccount?: ledger_pb.AccountIdentifier.AsObject,
    }

    export class Amount extends jspb.Message {
      getE8s(): string;
      setE8s(value: string): void;

      serializeBinary(): Uint8Array;
      toObject(includeInstance?: boolean): Amount.AsObject;
      static toObject(includeInstance: boolean, msg: Amount): Amount.AsObject;
      static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
      static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
      static serializeBinaryToWriter(message: Amount, writer: jspb.BinaryWriter): void;
      static deserializeBinary(bytes: Uint8Array): Amount;
      static deserializeBinaryFromReader(message: Amount, reader: jspb.BinaryReader): Amount;
    }

    export namespace Amount {
      export type AsObject = {
        e8s: string,
      }
    }
  }

  export class Follow extends jspb.Message {
    getTopic(): TopicMap[keyof TopicMap];
    setTopic(value: TopicMap[keyof TopicMap]): void;

    clearFolloweesList(): void;
    getFolloweesList(): Array<base_types_pb.NeuronId>;
    setFolloweesList(value: Array<base_types_pb.NeuronId>): void;
    addFollowees(value?: base_types_pb.NeuronId, index?: number): base_types_pb.NeuronId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Follow.AsObject;
    static toObject(includeInstance: boolean, msg: Follow): Follow.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Follow, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Follow;
    static deserializeBinaryFromReader(message: Follow, reader: jspb.BinaryReader): Follow;
  }

  export namespace Follow {
    export type AsObject = {
      topic: TopicMap[keyof TopicMap],
      followeesList: Array<base_types_pb.NeuronId.AsObject>,
    }
  }

  export class RegisterVote extends jspb.Message {
    hasProposal(): boolean;
    clearProposal(): void;
    getProposal(): base_types_pb.ProposalId | undefined;
    setProposal(value?: base_types_pb.ProposalId): void;

    getVote(): VoteMap[keyof VoteMap];
    setVote(value: VoteMap[keyof VoteMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisterVote.AsObject;
    static toObject(includeInstance: boolean, msg: RegisterVote): RegisterVote.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisterVote, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisterVote;
    static deserializeBinaryFromReader(message: RegisterVote, reader: jspb.BinaryReader): RegisterVote;
  }

  export namespace RegisterVote {
    export type AsObject = {
      proposal?: base_types_pb.ProposalId.AsObject,
      vote: VoteMap[keyof VoteMap],
    }
  }

  export class Merge extends jspb.Message {
    hasSourceNeuronId(): boolean;
    clearSourceNeuronId(): void;
    getSourceNeuronId(): base_types_pb.NeuronId | undefined;
    setSourceNeuronId(value?: base_types_pb.NeuronId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Merge.AsObject;
    static toObject(includeInstance: boolean, msg: Merge): Merge.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Merge, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Merge;
    static deserializeBinaryFromReader(message: Merge, reader: jspb.BinaryReader): Merge;
  }

  export namespace Merge {
    export type AsObject = {
      sourceNeuronId?: base_types_pb.NeuronId.AsObject,
    }
  }

  export class MergeMaturity extends jspb.Message {
    getPercentageToMerge(): number;
    setPercentageToMerge(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MergeMaturity.AsObject;
    static toObject(includeInstance: boolean, msg: MergeMaturity): MergeMaturity.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MergeMaturity, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MergeMaturity;
    static deserializeBinaryFromReader(message: MergeMaturity, reader: jspb.BinaryReader): MergeMaturity;
  }

  export namespace MergeMaturity {
    export type AsObject = {
      percentageToMerge: number,
    }
  }

  export class JoinCommunityFund extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): JoinCommunityFund.AsObject;
    static toObject(includeInstance: boolean, msg: JoinCommunityFund): JoinCommunityFund.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: JoinCommunityFund, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): JoinCommunityFund;
    static deserializeBinaryFromReader(message: JoinCommunityFund, reader: jspb.BinaryReader): JoinCommunityFund;
  }

  export namespace JoinCommunityFund {
    export type AsObject = {
    }
  }

  export enum NeuronIdOrSubaccountCase {
    NEURON_ID_OR_SUBACCOUNT_NOT_SET = 0,
    SUBACCOUNT = 11,
    NEURON_ID = 12,
  }

  export enum CommandCase {
    COMMAND_NOT_SET = 0,
    CONFIGURE = 2,
    DISBURSE = 3,
    SPAWN = 4,
    FOLLOW = 5,
    REGISTER_VOTE = 7,
    MERGE_MATURITY = 13,
    MERGE = 14,
  }
}

export class ManageNeuronResponse extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): GovernanceError | undefined;
  setError(value?: GovernanceError): void;

  hasConfigure(): boolean;
  clearConfigure(): void;
  getConfigure(): ManageNeuronResponse.ConfigureResponse | undefined;
  setConfigure(value?: ManageNeuronResponse.ConfigureResponse): void;

  hasDisburse(): boolean;
  clearDisburse(): void;
  getDisburse(): ManageNeuronResponse.DisburseResponse | undefined;
  setDisburse(value?: ManageNeuronResponse.DisburseResponse): void;

  hasSpawn(): boolean;
  clearSpawn(): void;
  getSpawn(): ManageNeuronResponse.SpawnResponse | undefined;
  setSpawn(value?: ManageNeuronResponse.SpawnResponse): void;

  hasFollow(): boolean;
  clearFollow(): void;
  getFollow(): ManageNeuronResponse.FollowResponse | undefined;
  setFollow(value?: ManageNeuronResponse.FollowResponse): void;

  hasRegisterVote(): boolean;
  clearRegisterVote(): void;
  getRegisterVote(): ManageNeuronResponse.RegisterVoteResponse | undefined;
  setRegisterVote(value?: ManageNeuronResponse.RegisterVoteResponse): void;

  hasMergeMaturity(): boolean;
  clearMergeMaturity(): void;
  getMergeMaturity(): ManageNeuronResponse.MergeMaturityResponse | undefined;
  setMergeMaturity(value?: ManageNeuronResponse.MergeMaturityResponse): void;

  hasMerge(): boolean;
  clearMerge(): void;
  getMerge(): ManageNeuronResponse.MergeResponse | undefined;
  setMerge(value?: ManageNeuronResponse.MergeResponse): void;

  getCommandCase(): ManageNeuronResponse.CommandCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ManageNeuronResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ManageNeuronResponse): ManageNeuronResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ManageNeuronResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ManageNeuronResponse;
  static deserializeBinaryFromReader(message: ManageNeuronResponse, reader: jspb.BinaryReader): ManageNeuronResponse;
}

export namespace ManageNeuronResponse {
  export type AsObject = {
    error?: GovernanceError.AsObject,
    configure?: ManageNeuronResponse.ConfigureResponse.AsObject,
    disburse?: ManageNeuronResponse.DisburseResponse.AsObject,
    spawn?: ManageNeuronResponse.SpawnResponse.AsObject,
    follow?: ManageNeuronResponse.FollowResponse.AsObject,
    registerVote?: ManageNeuronResponse.RegisterVoteResponse.AsObject,
    mergeMaturity?: ManageNeuronResponse.MergeMaturityResponse.AsObject,
    merge?: ManageNeuronResponse.MergeResponse.AsObject,
  }

  export class ConfigureResponse extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConfigureResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ConfigureResponse): ConfigureResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConfigureResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConfigureResponse;
    static deserializeBinaryFromReader(message: ConfigureResponse, reader: jspb.BinaryReader): ConfigureResponse;
  }

  export namespace ConfigureResponse {
    export type AsObject = {
    }
  }

  export class DisburseResponse extends jspb.Message {
    getTransferBlockHeight(): string;
    setTransferBlockHeight(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DisburseResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DisburseResponse): DisburseResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DisburseResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DisburseResponse;
    static deserializeBinaryFromReader(message: DisburseResponse, reader: jspb.BinaryReader): DisburseResponse;
  }

  export namespace DisburseResponse {
    export type AsObject = {
      transferBlockHeight: string,
    }
  }

  export class SpawnResponse extends jspb.Message {
    hasCreatedNeuronId(): boolean;
    clearCreatedNeuronId(): void;
    getCreatedNeuronId(): base_types_pb.NeuronId | undefined;
    setCreatedNeuronId(value?: base_types_pb.NeuronId): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SpawnResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SpawnResponse): SpawnResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SpawnResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SpawnResponse;
    static deserializeBinaryFromReader(message: SpawnResponse, reader: jspb.BinaryReader): SpawnResponse;
  }

  export namespace SpawnResponse {
    export type AsObject = {
      createdNeuronId?: base_types_pb.NeuronId.AsObject,
    }
  }

  export class MergeMaturityResponse extends jspb.Message {
    getMergedMaturityE8s(): string;
    setMergedMaturityE8s(value: string): void;

    getNewStakeE8s(): string;
    setNewStakeE8s(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MergeMaturityResponse.AsObject;
    static toObject(includeInstance: boolean, msg: MergeMaturityResponse): MergeMaturityResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MergeMaturityResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MergeMaturityResponse;
    static deserializeBinaryFromReader(message: MergeMaturityResponse, reader: jspb.BinaryReader): MergeMaturityResponse;
  }

  export namespace MergeMaturityResponse {
    export type AsObject = {
      mergedMaturityE8s: string,
      newStakeE8s: string,
    }
  }

  export class FollowResponse extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FollowResponse.AsObject;
    static toObject(includeInstance: boolean, msg: FollowResponse): FollowResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FollowResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FollowResponse;
    static deserializeBinaryFromReader(message: FollowResponse, reader: jspb.BinaryReader): FollowResponse;
  }

  export namespace FollowResponse {
    export type AsObject = {
    }
  }

  export class RegisterVoteResponse extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisterVoteResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RegisterVoteResponse): RegisterVoteResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisterVoteResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisterVoteResponse;
    static deserializeBinaryFromReader(message: RegisterVoteResponse, reader: jspb.BinaryReader): RegisterVoteResponse;
  }

  export namespace RegisterVoteResponse {
    export type AsObject = {
    }
  }

  export class MergeResponse extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MergeResponse.AsObject;
    static toObject(includeInstance: boolean, msg: MergeResponse): MergeResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MergeResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MergeResponse;
    static deserializeBinaryFromReader(message: MergeResponse, reader: jspb.BinaryReader): MergeResponse;
  }

  export namespace MergeResponse {
    export type AsObject = {
    }
  }

  export enum CommandCase {
    COMMAND_NOT_SET = 0,
    ERROR = 1,
    CONFIGURE = 2,
    DISBURSE = 3,
    SPAWN = 4,
    FOLLOW = 5,
    REGISTER_VOTE = 7,
    MERGE_MATURITY = 11,
    MERGE = 12,
  }
}

export class GovernanceError extends jspb.Message {
  getErrorType(): GovernanceError.ErrorTypeMap[keyof GovernanceError.ErrorTypeMap];
  setErrorType(value: GovernanceError.ErrorTypeMap[keyof GovernanceError.ErrorTypeMap]): void;

  getErrorMessage(): string;
  setErrorMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GovernanceError.AsObject;
  static toObject(includeInstance: boolean, msg: GovernanceError): GovernanceError.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GovernanceError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GovernanceError;
  static deserializeBinaryFromReader(message: GovernanceError, reader: jspb.BinaryReader): GovernanceError;
}

export namespace GovernanceError {
  export type AsObject = {
    errorType: GovernanceError.ErrorTypeMap[keyof GovernanceError.ErrorTypeMap],
    errorMessage: string,
  }

  export interface ErrorTypeMap {
    ERROR_TYPE_UNSPECIFIED: 0;
    ERROR_TYPE_OK: 1;
    ERROR_TYPE_UNAVAILABLE: 2;
    ERROR_TYPE_NOT_AUTHORIZED: 3;
    ERROR_TYPE_NOT_FOUND: 4;
    ERROR_TYPE_INVALID_COMMAND: 5;
    ERROR_TYPE_REQUIRES_NOT_DISSOLVING: 6;
    ERROR_TYPE_REQUIRES_DISSOLVING: 7;
    ERROR_TYPE_REQUIRES_DISSOLVED: 8;
    ERROR_TYPE_HOT_KEY: 9;
    ERROR_TYPE_RESOURCE_EXHAUSTED: 10;
    ERROR_TYPE_PRECONDITION_FAILED: 11;
    ERROR_TYPE_EXTERNAL: 12;
    ERROR_TYPE_LEDGER_UPDATE_ONGOING: 13;
    ERROR_TYPE_INSUFFICIENT_FUNDS: 14;
    ERROR_TYPE_INVALID_PRINCIPAL: 15;
    ERROR_TYPE_INVALID_PROPOSAL: 16;
    ERROR_TYPE_ALREADY_JOINED_COMMUNITY_FUND: 17;
  }

  export const ErrorType: ErrorTypeMap;
}

export class ListNeurons extends jspb.Message {
  clearNeuronIdsList(): void;
  getNeuronIdsList(): Array<string>;
  setNeuronIdsList(value: Array<string>): void;
  addNeuronIds(value: string, index?: number): string;

  getIncludeNeuronsReadableByCaller(): boolean;
  setIncludeNeuronsReadableByCaller(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListNeurons.AsObject;
  static toObject(includeInstance: boolean, msg: ListNeurons): ListNeurons.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListNeurons, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListNeurons;
  static deserializeBinaryFromReader(message: ListNeurons, reader: jspb.BinaryReader): ListNeurons;
}

export namespace ListNeurons {
  export type AsObject = {
    neuronIdsList: Array<string>,
    includeNeuronsReadableByCaller: boolean,
  }
}

export class ListNeuronsResponse extends jspb.Message {
  clearNeuronIdsList(): void;
  getNeuronIdsList(): Array<ListNeuronsResponse.NeuronMapEntry>;
  setNeuronIdsList(value: Array<ListNeuronsResponse.NeuronMapEntry>): void;
  addNeuronIds(value?: ListNeuronsResponse.NeuronMapEntry, index?: number): ListNeuronsResponse.NeuronMapEntry;

  clearFullNeuronsList(): void;
  getFullNeuronsList(): Array<Neuron>;
  setFullNeuronsList(value: Array<Neuron>): void;
  addFullNeurons(value?: Neuron, index?: number): Neuron;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListNeuronsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListNeuronsResponse): ListNeuronsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListNeuronsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListNeuronsResponse;
  static deserializeBinaryFromReader(message: ListNeuronsResponse, reader: jspb.BinaryReader): ListNeuronsResponse;
}

export namespace ListNeuronsResponse {
  export type AsObject = {
    neuronIdsList: Array<ListNeuronsResponse.NeuronMapEntry.AsObject>,
    fullNeuronsList: Array<Neuron.AsObject>,
  }

  export class NeuronMapEntry extends jspb.Message {
    getKey(): string;
    setKey(value: string): void;

    hasValue(): boolean;
    clearValue(): void;
    getValue(): NeuronInfo | undefined;
    setValue(value?: NeuronInfo): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NeuronMapEntry.AsObject;
    static toObject(includeInstance: boolean, msg: NeuronMapEntry): NeuronMapEntry.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NeuronMapEntry, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NeuronMapEntry;
    static deserializeBinaryFromReader(message: NeuronMapEntry, reader: jspb.BinaryReader): NeuronMapEntry;
  }

  export namespace NeuronMapEntry {
    export type AsObject = {
      key: string,
      value?: NeuronInfo.AsObject,
    }
  }
}

export class BallotInfo extends jspb.Message {
  hasProposalId(): boolean;
  clearProposalId(): void;
  getProposalId(): base_types_pb.ProposalId | undefined;
  setProposalId(value?: base_types_pb.ProposalId): void;

  getVote(): VoteMap[keyof VoteMap];
  setVote(value: VoteMap[keyof VoteMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BallotInfo.AsObject;
  static toObject(includeInstance: boolean, msg: BallotInfo): BallotInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BallotInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BallotInfo;
  static deserializeBinaryFromReader(message: BallotInfo, reader: jspb.BinaryReader): BallotInfo;
}

export namespace BallotInfo {
  export type AsObject = {
    proposalId?: base_types_pb.ProposalId.AsObject,
    vote: VoteMap[keyof VoteMap],
  }
}

export class NeuronInfo extends jspb.Message {
  getRetrievedAtTimestampSeconds(): string;
  setRetrievedAtTimestampSeconds(value: string): void;

  getAgeSeconds(): string;
  setAgeSeconds(value: string): void;

  getDissolveDelaySeconds(): string;
  setDissolveDelaySeconds(value: string): void;

  clearRecentBallotsList(): void;
  getRecentBallotsList(): Array<BallotInfo>;
  setRecentBallotsList(value: Array<BallotInfo>): void;
  addRecentBallots(value?: BallotInfo, index?: number): BallotInfo;

  getVotingPower(): string;
  setVotingPower(value: string): void;

  getCreatedTimestampSeconds(): string;
  setCreatedTimestampSeconds(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NeuronInfo.AsObject;
  static toObject(includeInstance: boolean, msg: NeuronInfo): NeuronInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NeuronInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NeuronInfo;
  static deserializeBinaryFromReader(message: NeuronInfo, reader: jspb.BinaryReader): NeuronInfo;
}

export namespace NeuronInfo {
  export type AsObject = {
    retrievedAtTimestampSeconds: string,
    ageSeconds: string,
    dissolveDelaySeconds: string,
    recentBallotsList: Array<BallotInfo.AsObject>,
    votingPower: string,
    createdTimestampSeconds: string,
  }
}

export class Neuron extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): base_types_pb.NeuronId | undefined;
  setId(value?: base_types_pb.NeuronId): void;

  getAccount(): Uint8Array | string;
  getAccount_asU8(): Uint8Array;
  getAccount_asB64(): string;
  setAccount(value: Uint8Array | string): void;

  hasController(): boolean;
  clearController(): void;
  getController(): base_types_pb.PrincipalId | undefined;
  setController(value?: base_types_pb.PrincipalId): void;

  clearHotKeysList(): void;
  getHotKeysList(): Array<base_types_pb.PrincipalId>;
  setHotKeysList(value: Array<base_types_pb.PrincipalId>): void;
  addHotKeys(value?: base_types_pb.PrincipalId, index?: number): base_types_pb.PrincipalId;

  getCachedNeuronStakeE8s(): string;
  setCachedNeuronStakeE8s(value: string): void;

  getNeuronFeesE8s(): string;
  setNeuronFeesE8s(value: string): void;

  getCreatedTimestampSeconds(): string;
  setCreatedTimestampSeconds(value: string): void;

  getAgingSinceTimestampSeconds(): string;
  setAgingSinceTimestampSeconds(value: string): void;

  hasWhenDissolvedTimestampSeconds(): boolean;
  clearWhenDissolvedTimestampSeconds(): void;
  getWhenDissolvedTimestampSeconds(): string;
  setWhenDissolvedTimestampSeconds(value: string): void;

  hasDissolveDelaySeconds(): boolean;
  clearDissolveDelaySeconds(): void;
  getDissolveDelaySeconds(): string;
  setDissolveDelaySeconds(value: string): void;

  getFolloweesMap(): jspb.Map<number, Neuron.Followees>;
  clearFolloweesMap(): void;
  clearRecentBallotsList(): void;
  getRecentBallotsList(): Array<BallotInfo>;
  setRecentBallotsList(value: Array<BallotInfo>): void;
  addRecentBallots(value?: BallotInfo, index?: number): BallotInfo;

  getKycVerified(): boolean;
  setKycVerified(value: boolean): void;

  hasTransfer(): boolean;
  clearTransfer(): void;
  getTransfer(): NeuronStakeTransfer | undefined;
  setTransfer(value?: NeuronStakeTransfer): void;

  getMaturityE8sEquivalent(): string;
  setMaturityE8sEquivalent(value: string): void;

  getNotForProfit(): boolean;
  setNotForProfit(value: boolean): void;

  getDissolveStateCase(): Neuron.DissolveStateCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Neuron.AsObject;
  static toObject(includeInstance: boolean, msg: Neuron): Neuron.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Neuron, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Neuron;
  static deserializeBinaryFromReader(message: Neuron, reader: jspb.BinaryReader): Neuron;
}

export namespace Neuron {
  export type AsObject = {
    id?: base_types_pb.NeuronId.AsObject,
    account: Uint8Array | string,
    controller?: base_types_pb.PrincipalId.AsObject,
    hotKeysList: Array<base_types_pb.PrincipalId.AsObject>,
    cachedNeuronStakeE8s: string,
    neuronFeesE8s: string,
    createdTimestampSeconds: string,
    agingSinceTimestampSeconds: string,
    whenDissolvedTimestampSeconds: string,
    dissolveDelaySeconds: string,
    followeesMap: Array<[number, Neuron.Followees.AsObject]>,
    recentBallotsList: Array<BallotInfo.AsObject>,
    kycVerified: boolean,
    transfer?: NeuronStakeTransfer.AsObject,
    maturityE8sEquivalent: string,
    notForProfit: boolean,
  }

  export class Followees extends jspb.Message {
    clearFolloweesList(): void;
    getFolloweesList(): Array<base_types_pb.NeuronId>;
    setFolloweesList(value: Array<base_types_pb.NeuronId>): void;
    addFollowees(value?: base_types_pb.NeuronId, index?: number): base_types_pb.NeuronId;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Followees.AsObject;
    static toObject(includeInstance: boolean, msg: Followees): Followees.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Followees, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Followees;
    static deserializeBinaryFromReader(message: Followees, reader: jspb.BinaryReader): Followees;
  }

  export namespace Followees {
    export type AsObject = {
      followeesList: Array<base_types_pb.NeuronId.AsObject>,
    }
  }

  export enum DissolveStateCase {
    DISSOLVE_STATE_NOT_SET = 0,
    WHEN_DISSOLVED_TIMESTAMP_SECONDS = 9,
    DISSOLVE_DELAY_SECONDS = 10,
  }
}

export class NeuronStakeTransfer extends jspb.Message {
  getTransferTimestamp(): string;
  setTransferTimestamp(value: string): void;

  hasFrom(): boolean;
  clearFrom(): void;
  getFrom(): base_types_pb.PrincipalId | undefined;
  setFrom(value?: base_types_pb.PrincipalId): void;

  getFromSubaccount(): Uint8Array | string;
  getFromSubaccount_asU8(): Uint8Array;
  getFromSubaccount_asB64(): string;
  setFromSubaccount(value: Uint8Array | string): void;

  getToSubaccount(): Uint8Array | string;
  getToSubaccount_asU8(): Uint8Array;
  getToSubaccount_asB64(): string;
  setToSubaccount(value: Uint8Array | string): void;

  getNeuronStakeE8s(): string;
  setNeuronStakeE8s(value: string): void;

  getBlockHeight(): string;
  setBlockHeight(value: string): void;

  getMemo(): string;
  setMemo(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NeuronStakeTransfer.AsObject;
  static toObject(includeInstance: boolean, msg: NeuronStakeTransfer): NeuronStakeTransfer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NeuronStakeTransfer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NeuronStakeTransfer;
  static deserializeBinaryFromReader(message: NeuronStakeTransfer, reader: jspb.BinaryReader): NeuronStakeTransfer;
}

export namespace NeuronStakeTransfer {
  export type AsObject = {
    transferTimestamp: string,
    from?: base_types_pb.PrincipalId.AsObject,
    fromSubaccount: Uint8Array | string,
    toSubaccount: Uint8Array | string,
    neuronStakeE8s: string,
    blockHeight: string,
    memo: string,
  }
}

export interface VoteMap {
  VOTE_UNSPECIFIED: 0;
  VOTE_YES: 1;
  VOTE_NO: 2;
}

export const Vote: VoteMap;

export interface TopicMap {
  TOPIC_UNSPECIFIED: 0;
  TOPIC_NEURON_MANAGEMENT: 1;
  TOPIC_EXCHANGE_RATE: 2;
  TOPIC_NETWORK_ECONOMICS: 3;
  TOPIC_GOVERNANCE: 4;
  TOPIC_NODE_ADMIN: 5;
  TOPIC_PARTICIPANT_MANAGEMENT: 6;
  TOPIC_SUBNET_MANAGEMENT: 7;
  TOPIC_NETWORK_CANISTER_MANAGEMENT: 8;
  TOPIC_KYC: 9;
  TOPIC_NODE_PROVIDER_REWARDS: 10;
}

export const Topic: TopicMap;

