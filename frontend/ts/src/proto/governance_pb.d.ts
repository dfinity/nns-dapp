// package: ic_nns_governance.pb.v1
// file: governance.proto

import * as jspb from "google-protobuf";
import * as base_types_pb from "./base_types_pb";

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
    }

    export enum OperationCase {
      OPERATION_NOT_SET = 0,
      INCREASE_DISSOLVE_DELAY = 1,
      START_DISSOLVING = 2,
      STOP_DISSOLVING = 3,
      ADD_HOT_KEY = 4,
      REMOVE_HOT_KEY = 5,
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

  export enum CommandCase {
    COMMAND_NOT_SET = 0,
    ERROR = 1,
    CONFIGURE = 2,
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
  }

  export const ErrorType: ErrorTypeMap;
}

