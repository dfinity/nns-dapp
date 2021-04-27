// package: ic_base_types.pb.v1
// file: base_types.proto

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

  export const tuiSignedMessage: jspb.ExtensionFieldInfo<boolean>;

  export const tuiSignedDisplayQ22021: jspb.ExtensionFieldInfo<boolean>;

