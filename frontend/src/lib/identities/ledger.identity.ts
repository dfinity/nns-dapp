import { LEDGER_DEFAULT_DERIVE_PATH } from "$lib/constants/ledger.constants";
import type { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { i18n } from "$lib/stores/i18n";
import {
  LedgerErrorKey,
  LedgerErrorMessage,
  type LedgerHQTransportError,
} from "$lib/types/ledger.errors";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  decodePublicKey,
  decodeSignature,
  decodeSignatures,
  type RequestSignatures,
} from "$lib/utils/ledger.utils";
import {
  Cbor,
  SignIdentity,
  requestIdOf,
  type CallRequest,
  type HttpAgentRequest,
  type PublicKey,
  type ReadRequest,
  type ReadRequestType,
  type ReadStateRequest,
  type Signature,
} from "@dfinity/agent";
import { nonNullish } from "@dfinity/utils";
import type Transport from "@ledgerhq/hw-transport";
import type LedgerApp from "@zondax/ledger-icp";
import type {
  ResponseAddress,
  ResponseSign,
  ResponseSignUpdateCall,
  ResponseVersion,
} from "@zondax/ledger-icp";
import { get } from "svelte/store";

// TODO(L2-433): should we use @dfinity/identity-ledgerhq

type ReadStateData = {
  signature: Signature;
  body: ReadStateRequest;
};

export class LedgerIdentity extends SignIdentity {
  // TODO(L2-433): is there a better way to solve this requirements than a class variable that is set and unset?
  // A flag to signal that the next transaction to be signed will be a "stake neuron" transaction.
  private neuronStakeFlag = false;
  // Used to avoid signing the read state transaction twice.
  // Map<requestIdHex, ReadStateData>
  private readStateMap: Map<string, ReadStateData> = new Map();

  private constructor(
    private readonly derivePath: string,
    private readonly publicKey: Secp256k1PublicKey
  ) {
    super();
  }

  public static async create(
    derivePath = LEDGER_DEFAULT_DERIVE_PATH
  ): Promise<LedgerIdentity> {
    const { app, transport } = await this.connect();

    try {
      const publicKey = await this.fetchPublicKeyFromDevice({
        app,
        derivePath,
      });

      return new this(derivePath, publicKey);
    } finally {
      // Always close the transport.
      await transport.close();
    }
  }

  public override getPublicKey(): PublicKey {
    return this.publicKey;
  }

  public override async sign(blob: ArrayBuffer): Promise<Signature> {
    const callback = async (app: LedgerApp): Promise<Signature> => {
      const responseSign: ResponseSign = await app.sign(
        this.derivePath,
        Buffer.from(blob),
        this.neuronStakeFlag ? 1 : 0
      );

      // Remove the "neuron stake" flag, since we already signed the transaction.
      this.neuronStakeFlag = false;

      return decodeSignature(responseSign);
    };

    return this.executeWithApp<Signature>(callback);
  }

  private async signWithReadState(
    callBlob: ArrayBuffer,
    readStateBlob: ArrayBuffer
  ): Promise<RequestSignatures> {
    const callback = async (app: LedgerApp): Promise<RequestSignatures> => {
      const responseSign: ResponseSignUpdateCall = await app.signUpdateCall(
        this.derivePath,
        Buffer.from(callBlob),
        Buffer.from(readStateBlob),
        this.neuronStakeFlag ? 1 : 0
      );

      // Remove the "neuron stake" flag, since we already signed the transaction.
      this.neuronStakeFlag = false;

      return decodeSignatures(responseSign);
    };

    return this.executeWithApp<RequestSignatures>(callback);
  }

  /**
   * Signals that the upcoming transaction to be signed will be a "stake neuron" transaction.
   */
  public flagUpcomingStakeNeuron(): void {
    this.neuronStakeFlag = true;
  }

  /**
   * Required by Ledger.com that the user should be able to press a Button in UI
   * and verify the address/pubkey are the same as on the device screen.
   */
  public async showAddressAndPubKeyOnDevice(): Promise<ResponseAddress> {
    // The function `showAddressAndPubKey` should not be destructured from the `app` because it internally accesses `this.transport` that refers to an `app` variable
    const callback = (app: LedgerApp): Promise<ResponseAddress> =>
      app.showAddressAndPubKey(this.derivePath);

    return this.executeWithApp<ResponseAddress>(callback);
  }

  /**
   * @returns The version of the `Internet Computer' app installed on the Ledger device.
   */
  public async getVersion(): Promise<ResponseVersion> {
    // See comment about `app` in function `showAddressAndPubKeyOnDevice`
    const callback = async (app: LedgerApp): Promise<ResponseVersion> =>
      app.getVersion();

    return this.executeWithApp<ResponseVersion>(callback);
  }

  private static async getTransport(): Promise<Transport> {
    const { default: TransportWebHID } = await import(
      "@ledgerhq/hw-transport-webhid"
    );
    return TransportWebHID.create();
  }

  // Public to be able to mock it in tests.
  public static async connect(): Promise<{
    app: LedgerApp;
    transport: Transport;
  }> {
    try {
      const transport = await this.getTransport();

      const { default: LedgerAppConstructor } = await import(
        "@zondax/ledger-icp"
      );
      const app = new LedgerAppConstructor(transport);

      return { app, transport };
    } catch (err: unknown) {
      if (
        (err as LedgerHQTransportError)?.name === "TransportOpenUserCancelled"
      ) {
        if (
          (err as LedgerHQTransportError)?.message.includes("not supported")
        ) {
          throw new LedgerErrorKey("error__ledger.browser_not_supported");
        }
        throw new LedgerErrorKey("error__ledger.access_denied");
      }

      if ((err as LedgerHQTransportError)?.id === "NoDeviceFound") {
        throw new LedgerErrorKey("error__ledger.connect_no_device");
      }

      if (
        (err as LedgerHQTransportError).message?.includes(
          "cannot open device with path"
        )
      ) {
        throw new LedgerErrorKey("error__ledger.connect_many_apps");
      }

      // Unsupported browser. Data on browser compatibility is taken from https://caniuse.com/webhid
      const labels = get(i18n);

      throw new LedgerErrorMessage(
        replacePlaceholders(labels.error__ledger.connect_not_supported, {
          $err: `${err}`,
        })
      );
    }
  }

  // Public to be able to mock it in tests.
  public static async fetchPublicKeyFromDevice({
    app,
    derivePath,
  }: {
    app: LedgerApp;
    derivePath: string;
  }): Promise<Secp256k1PublicKey> {
    const response = await app.getAddressAndPubKey(derivePath);

    return decodePublicKey(response);
  }

  public clearInstanceVariablesForTesting(): void {
    this.neuronStakeFlag = false;
    this.readStateMap = new Map();
  }

  private async executeWithApp<T>(
    callback: (app: LedgerApp) => Promise<T>
  ): Promise<T> {
    const { app, transport } = await LedgerIdentity.connect();

    try {
      // Verify that the public key of the device matches the public key of this identity.
      const devicePublicKey: Secp256k1PublicKey =
        await LedgerIdentity.fetchPublicKeyFromDevice({
          app,
          derivePath: this.derivePath,
        });

      if (JSON.stringify(devicePublicKey) !== JSON.stringify(this.publicKey)) {
        throw new LedgerErrorKey("error__ledger.unexpected_wallet");
      }

      // Run the provided function.
      return await callback(app);
    } finally {
      await transport.close();
    }
  }

  /**
   * Required implementation for agent-js transformRequest.
   *
   * Without following function, transaction processed by the ledger would end in error "27012 - Data is invalid : Unexpected data type"
   */
  public override async transformRequest(
    request: HttpAgentRequest
  ): Promise<Record<string, unknown>> {
    if (
      // Any other call will reset `readStateSignature` and `readStateBody`.
      // Can't import Endpoint as value from @dfinity/agent because it's const enum.
      request.endpoint === "read_state"
    ) {
      const { body: _body, ...fields } = request;
      const [_, requestId] = _body.paths[0];
      const requestIdHex = Buffer.from(requestId).toString("hex");
      const requestData = this.readStateMap.get(requestIdHex);
      if (nonNullish(requestData)) {
        const { signature, body } = requestData;
        return {
          ...fields,
          body: {
            content: body,
            sender_pubkey: this.publicKey.toDer(),
            sender_sig: signature,
          },
        };
      }
    }

    /**
     * Convert the HttpAgentRequest body into cbor which can be signed by the Ledger Hardware Wallet.
     * @param request - body of the HttpAgentRequest
     */
    const prepareCborForLedger = (
      request: ReadRequest | CallRequest
    ): ArrayBuffer => Cbor.encode({ content: request });
    const { body, ...fields } = request;

    const requestId = await requestIdOf(body);

    let callSignature: Signature;
    // There is an issue with the Ledger App when the neuron flag is set to true and `signWithReadState`.
    // TODO: Check app version and use `signWithReadState` only if the app version has the issue fixed.
    if (this.neuronStakeFlag || request.endpoint === "read_state") {
      callSignature = await this.sign(prepareCborForLedger(body));
    } else {
      // Store the body of the read state request to be able to reuse it later.
      const readStateBody = {
        // Can't import ReadRequestType as value from @dfinity/agent because it's const enum
        request_type: "read_state" as ReadRequestType.ReadState,
        // Check docs for more detais: https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-read-state
        paths: [[new TextEncoder().encode("request_status"), requestId]],
        ingress_expiry: body.ingress_expiry,
        sender: body.sender,
      };
      const signatures = await this.signWithReadState(
        prepareCborForLedger(body),
        prepareCborForLedger(readStateBody)
      );
      callSignature = signatures.callSignature;
      // Store the read state signature to be able to reuse it later.
      const requestIdHex = Buffer.from(requestId).toString("hex");
      this.readStateMap.set(requestIdHex, {
        signature: signatures.readStateSignature,
        body: readStateBody,
      });
    }

    return {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.publicKey.toDer(),
        sender_sig: callSignature,
      },
    };
  }
}
