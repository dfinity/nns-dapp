// package: ic_base_types.pb.v1
// file: proto/base_types.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_descriptor_pb from "google-protobuf/google/protobuf/descriptor_pb";

export class PrincipalId extends jspb.Message {
  getSerializedId(): Uint8Array | string;
  getSerializedId_asU8(): Uint8Array;
  getSerializedId_asB64(): string;
  setSerializedId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrincipalId.AsObject;
  static toObject(includeInstance: boolean, msg: PrincipalId): PrincipalId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrincipalId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrincipalId;
  static deserializeBinaryFromReader(message: PrincipalId, reader: jspb.BinaryReader): PrincipalId;
}

export namespace PrincipalId {
  export type AsObject = {
    serializedId: Uint8Array | string,
  }
}

export class CanisterId extends jspb.Message {
  getSerializedId(): Uint8Array | string;
  getSerializedId_asU8(): Uint8Array;
  getSerializedId_asB64(): string;
  setSerializedId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CanisterId.AsObject;
  static toObject(includeInstance: boolean, msg: CanisterId): CanisterId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CanisterId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CanisterId;
  static deserializeBinaryFromReader(message: CanisterId, reader: jspb.BinaryReader): CanisterId;
}

export namespace CanisterId {
  export type AsObject = {
    serializedId: Uint8Array | string,
  }
}

export class NeuronId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NeuronId.AsObject;
  static toObject(includeInstance: boolean, msg: NeuronId): NeuronId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NeuronId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NeuronId;
  static deserializeBinaryFromReader(message: NeuronId, reader: jspb.BinaryReader): NeuronId;
}

export namespace NeuronId {
  export type AsObject = {
    id: string,
  }
}

export class ProposalId extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposalId.AsObject;
  static toObject(includeInstance: boolean, msg: ProposalId): ProposalId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProposalId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposalId;
  static deserializeBinaryFromReader(message: ProposalId, reader: jspb.BinaryReader): ProposalId;
}

export namespace ProposalId {
  export type AsObject = {
    id: string,
  }
}

export class MethodAuthzInfo extends jspb.Message {
  getMethodName(): string;
  setMethodName(value: string): void;

  clearPrincipalIdsList(): void;
  getPrincipalIdsList(): Array<Uint8Array | string>;
  getPrincipalIdsList_asU8(): Array<Uint8Array>;
  getPrincipalIdsList_asB64(): Array<string>;
  setPrincipalIdsList(value: Array<Uint8Array | string>): void;
  addPrincipalIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MethodAuthzInfo.AsObject;
  static toObject(includeInstance: boolean, msg: MethodAuthzInfo): MethodAuthzInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MethodAuthzInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MethodAuthzInfo;
  static deserializeBinaryFromReader(message: MethodAuthzInfo, reader: jspb.BinaryReader): MethodAuthzInfo;
}

export namespace MethodAuthzInfo {
  export type AsObject = {
    methodName: string,
    principalIdsList: Array<Uint8Array | string>,
  }
}

export class CanisterAuthzInfo extends jspb.Message {
  clearMethodsAuthzList(): void;
  getMethodsAuthzList(): Array<MethodAuthzInfo>;
  setMethodsAuthzList(value: Array<MethodAuthzInfo>): void;
  addMethodsAuthz(value?: MethodAuthzInfo, index?: number): MethodAuthzInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CanisterAuthzInfo.AsObject;
  static toObject(includeInstance: boolean, msg: CanisterAuthzInfo): CanisterAuthzInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CanisterAuthzInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CanisterAuthzInfo;
  static deserializeBinaryFromReader(message: CanisterAuthzInfo, reader: jspb.BinaryReader): CanisterAuthzInfo;
}

export namespace CanisterAuthzInfo {
  export type AsObject = {
    methodsAuthzList: Array<MethodAuthzInfo.AsObject>,
  }
}

  export const tuiSignedMessage: jspb.ExtensionFieldInfo<boolean>;

  export const tuiSignedDisplayQ22021: jspb.ExtensionFieldInfo<boolean>;

