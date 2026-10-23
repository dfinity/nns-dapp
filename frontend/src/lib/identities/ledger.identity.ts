import { ALL_CANDID_TXS_VERSION } from "$lib/constants/ledger-app.constants";
import { LEDGER_DEFAULT_DERIVE_PATH } from "$lib/constants/ledger.constants";
import type { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { i18n } from "$lib/stores/i18n";
import { LedgerErrorKey, LedgerErrorMessage } from "$lib/types/ledger.errors";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  createReadStatePaths,
  decodePublicKey,
  decodeSignature,
  decodeUpdateSignatures,
  getRequestId,
  type RequestSignatures,
} from "$lib/utils/ledger.utils";
import {
  isNullish,
  nonNullish,
  smallerVersion,
  uint8ArraysEqual,
} from "@dfinity/utils";
import {
  Cbor,
  SignIdentity,
  requestIdOf,
  type CallRequest,
  type HttpAgentReadStateRequest,
  type HttpAgentRequest,
  type PublicKey,
  type ReadRequest,
  type ReadRequestType,
  type ReadStateRequest,
  type RequestId,
  type Signature,
} from "@icp-sdk/core/agent";
import type {
  DeviceManagementKit,
  DiscoveredDevice,
  DmkError,
} from "@ledgerhq/device-management-kit";
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

// How long to wait for a device that the user already allowed before the browser asks for a device.
const KNOWN_DEVICE_TIMEOUT_MS = 500;

let deviceManagementKit: DeviceManagementKit | undefined;

export class LedgerIdentity extends SignIdentity {
  // TODO(L2-433): is there a better way to solve this requirements than a class variable that is set and unset?
  // A flag to signal that the next transaction to be signed will be a "stake neuron" transaction.
  private neuronStakeFlag = false;
  // Used to avoid signing the read state transaction twice.
  // The key is the request id of the first request, not the read state request.
  // Entries from the map are never removed. Because each one required manual action from the user with a HW wallet, it shouldn't get very large.
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
    const { app, disconnect } = await this.connect();

    try {
      const publicKey = await this.fetchPublicKeyFromDevice({
        app,
        derivePath,
      });

      return new this(derivePath, publicKey);
    } finally {
      // Always disconnect from the device.
      await disconnect();
    }
  }

  public override getPublicKey(): Required<PublicKey> {
    return this.publicKey;
  }

  private raiseIfVersionIsDeprecated = async () => {
    const { major, minor, patch } = await this.getVersion();
    const currentVersion = `${major}.${minor}.${patch}`;
    if (
      smallerVersion({ minVersion: ALL_CANDID_TXS_VERSION, currentVersion })
    ) {
      throw new LedgerErrorKey({
        message: "error__ledger.app_version_not_supported",
        renderAsHtml: true,
      });
    }
  };

  public override async sign(blob: Uint8Array): Promise<Signature> {
    await this.raiseIfVersionIsDeprecated();

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
    callBlob: Uint8Array,
    readStateBlob: Uint8Array
  ): Promise<RequestSignatures> {
    await this.raiseIfVersionIsDeprecated();

    const callback = async (app: LedgerApp): Promise<RequestSignatures> => {
      const responseSign: ResponseSignUpdateCall = await app.signUpdateCall(
        this.derivePath,
        Buffer.from(callBlob),
        Buffer.from(readStateBlob),
        this.neuronStakeFlag ? 1 : 0
      );

      // Remove the "neuron stake" flag, since we already signed the transaction.
      this.neuronStakeFlag = false;

      return decodeUpdateSignatures(responseSign);
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
   * @returns The version of the `Internet Computer' app installed on the Ledger device and the device model used under the `targeId` key:
   *
   * 0x3110???? => LNS
   * 0x3300???? => LNX
   * 0x3310???? => LNS+
   * 0x3320???? => stax
   *
   * Source: https://github.com/LedgerHQ/blue-loader-python?tab=readme-ov-file#target-id
   *
   * PS: Another way to find the device model is the `deviceModel` field of the discovered device.
   */
  public async getVersion(): Promise<ResponseVersion> {
    // See comment about `app` in function `showAddressAndPubKeyOnDevice`
    const callback = async (app: LedgerApp): Promise<ResponseVersion> =>
      app.getVersion();

    return this.executeWithApp<ResponseVersion>(callback);
  }

  private static async getDeviceManagementKit(): Promise<DeviceManagementKit> {
    if (isNullish(deviceManagementKit)) {
      const [{ DeviceManagementKitBuilder }, { webHidTransportFactory }] =
        await Promise.all([
          import("@ledgerhq/device-management-kit"),
          import("@ledgerhq/device-transport-kit-web-hid"),
        ]);
      deviceManagementKit = new DeviceManagementKitBuilder()
        .addTransport(webHidTransportFactory)
        .build();
    }
    return deviceManagementKit;
  }

  // Uses a device that the user already allowed, so that the browser asks for a device only once.
  private static async findDevice(
    dmk: DeviceManagementKit
  ): Promise<DiscoveredDevice> {
    const { filter, firstValueFrom, timeout, TimeoutError } = await import(
      "rxjs"
    );

    try {
      const [device] = await firstValueFrom(
        dmk.listenToAvailableDevices({}).pipe(
          filter((devices) => devices.length > 0),
          timeout({ first: KNOWN_DEVICE_TIMEOUT_MS })
        )
      );
      return device;
    } catch (err: unknown) {
      if (!(err instanceof TimeoutError)) {
        throw err;
      }
    }

    return firstValueFrom(dmk.startDiscovering({}));
  }

  // Public to be able to mock it in tests.
  public static async connect(): Promise<{
    app: LedgerApp;
    disconnect: () => Promise<void>;
  }> {
    try {
      const dmk = await this.getDeviceManagementKit();

      if (!dmk.isEnvironmentSupported()) {
        throw new LedgerErrorKey({
          message: "error__ledger.browser_not_supported",
        });
      }

      const device = await this.findDevice(dmk);
      const sessionId = await dmk.connect({
        device,
        // The refresher polls the device between the APDUs of a multi-APDU signature.
        sessionRefresherOptions: { isRefresherDisabled: true },
      });

      const [{ default: LedgerAppConstructor }, { DMKTransport }] =
        await Promise.all([
          import("@zondax/ledger-icp"),
          import("@zondax/ledger-js"),
        ]);
      const app = new LedgerAppConstructor(new DMKTransport(dmk, sessionId));

      return { app, disconnect: () => dmk.disconnect({ sessionId }) };
    } catch (err: unknown) {
      if (err instanceof LedgerErrorKey) {
        throw err;
      }

      const { _tag: tag } = (err ?? {}) as Partial<DmkError>;

      if (tag === "NoAccessibleDeviceError") {
        throw new LedgerErrorKey({ message: "error__ledger.access_denied" });
      }

      if (tag === "UnknownDeviceError") {
        throw new LedgerErrorKey({
          message: "error__ledger.connect_no_device",
        });
      }

      // The browser cannot open the device if another application uses it.
      if (tag === "ConnectionOpeningError") {
        throw new LedgerErrorKey({
          message: "error__ledger.connect_many_apps",
        });
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

  private async executeWithApp<T>(
    callback: (app: LedgerApp) => Promise<T>
  ): Promise<T> {
    const { app, disconnect } = await LedgerIdentity.connect();

    try {
      // Verify that the public key of the device matches the public key of this identity.
      const devicePublicKey: Secp256k1PublicKey =
        await LedgerIdentity.fetchPublicKeyFromDevice({
          app,
          derivePath: this.derivePath,
        });

      if (JSON.stringify(devicePublicKey) !== JSON.stringify(this.publicKey)) {
        throw new LedgerErrorKey({
          message: "error__ledger.unexpected_wallet",
        });
      }

      // Run the provided function.
      return await callback(app);
    } finally {
      await disconnect();
    }
  }

  private async getRequestFromCache(
    request: HttpAgentReadStateRequest
  ): Promise<Record<string, unknown> | undefined> {
    const { body, ...fields } = request;
    const requestId = getRequestId(body);
    const requestIdHex = Buffer.from(requestId).toString("hex");
    const requestData = this.readStateMap.get(requestIdHex);

    if (isNullish(requestData)) {
      console.warn(
        `No cached data for read state request with id ${requestIdHex}.`
      );
      return;
    }
    const { signature, body: cachedBody } = requestData;
    // If cached data doesn't match, ignore and move on to sign the request.
    // The `ingress_expiry` is different in the cached in the new request because the new one is created after the first call.
    // But the signature was done with the cached body. That's why we use the cached body.
    const newBody = {
      ...body,
      ingress_expiry: cachedBody.ingress_expiry,
    };
    if (this.requestsMatch(cachedBody, newBody)) {
      return {
        ...fields,
        body: {
          content: cachedBody,
          sender_pubkey: this.publicKey.toDer(),
          sender_sig: signature,
        },
      };
    }
    console.warn("Cached request doesn't match read state request.");
  }

  private async createReadStateRequest(
    body: CallRequest
  ): Promise<{ readStateBody: ReadStateRequest; requestId: RequestId }> {
    const requestId = await requestIdOf(body);
    const readStateBody: ReadRequest = {
      // Can't import ReadRequestType as value from @icp-sdk/core/agent because it's const enum
      request_type: "read_state" as ReadRequestType.ReadState,
      paths: createReadStatePaths(requestId).map((path) =>
        path.map((bufferLike) => new Uint8Array(bufferLike))
      ),
      ingress_expiry: body.ingress_expiry,
      sender: body.sender,
    };
    return {
      readStateBody,
      requestId,
    };
  }

  private storeRequestInCache({
    requestId,
    signature,
    body,
  }: {
    requestId: RequestId;
    signature: Signature;
    body: ReadStateRequest;
  }) {
    // Store the read state signature to be able to reuse it later.
    const requestIdHex = Buffer.from(requestId).toString("hex");
    this.readStateMap.set(requestIdHex, {
      signature: signature,
      body,
    });
  }

  /**
   * Convert the HttpAgentRequest body into cbor which can be signed by the Ledger Device.
   * @param request - body of the HttpAgentRequest
   */
  private prepareCborForLedger = (
    request: ReadRequest | CallRequest
  ): Uint8Array => Cbor.encode({ content: request });

  private requestsMatch = (
    request1: ReadRequest,
    request2: ReadRequest
  ): boolean => {
    // CBOR encoding is sensitive to property order - different orders produce different encodings.
    // This helper function normalizes property order before encoding to ensure consistent comparison.
    const normalizeRequests = (request: ReadRequest): ReadRequest => {
      return Object.keys(request)
        .sort()
        .reduce<ReadRequest>((acc, key) => {
          acc[key] = request[key];
          return acc;
        }, {} as ReadRequest);
    };
    const sortedRequest1 = normalizeRequests(request1);
    const sortedRequest2 = normalizeRequests(request2);

    return uint8ArraysEqual({
      a: this.prepareCborForLedger(sortedRequest1),
      b: this.prepareCborForLedger(sortedRequest2),
    });
  };

  private async createSignAndStoreCallRequests(request: HttpAgentRequest) {
    const { body, ...fields } = request;
    // If the request endpoint is a "call", then the body is a CallRequest.
    // Reference: https://github.com/dfinity/agent-js/blob/ce772199189748f9b77c8eb3ceeb3fdd11c70b5b/packages/agent/src/agent/http/types.ts#L28
    const callBody = body as CallRequest;
    const { requestId, readStateBody } =
      await this.createReadStateRequest(callBody);
    const signatures = await this.signWithReadState(
      this.prepareCborForLedger(body),
      this.prepareCborForLedger(readStateBody)
    );
    this.storeRequestInCache({
      requestId,
      signature: signatures.readStateSignature,
      body: readStateBody,
    });

    return {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.publicKey.toDer(),
        sender_sig: signatures.callSignature,
      },
    };
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
      // "read_state" is a value from Endpoint enum from @icp-sdk/core/agent but it's const enum and can't be imported as value with `isolatedModules` flag.
      // More info: https://github.com/microsoft/TypeScript/issues/40344#issuecomment-956368612
      request.endpoint === "read_state"
    ) {
      const cachedRequest = await this.getRequestFromCache(request);
      if (nonNullish(cachedRequest)) {
        return cachedRequest;
      }
    }

    if (request.endpoint === "call") {
      return this.createSignAndStoreCallRequests(request);
    }

    const { body, ...fields } = request;
    return {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.publicKey.toDer(),
        sender_sig: await this.sign(this.prepareCborForLedger(body)),
      },
    };
  }
}
