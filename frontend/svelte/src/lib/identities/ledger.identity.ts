import {
  Cbor,
  SignIdentity,
  type CallRequest,
  type HttpAgentRequest,
  type PublicKey,
  type ReadRequest,
  type Signature,
} from "@dfinity/agent";
import type Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import type { ResponseAddress, ResponseVersion } from "@zondax/ledger-icp";
import LedgerApp, { type ResponseSign } from "@zondax/ledger-icp";
import { get } from "svelte/store";
import { LEDGER_DEFAULT_DERIVE_PATH } from "../constants/ledger.constants";
import type { Secp256k1PublicKey } from "../keys/secp256k1";
import { i18n } from "../stores/i18n";
import {
  LedgerErrorKey,
  LedgerErrorMessage,
  type LedgerHQTransportError,
} from "../types/ledger.errors";
import { replacePlaceholders } from "../utils/i18n.utils";
import { decodePublicKey, decodeSignature } from "../utils/ledger.utils";

// TODO(L2-433): should we use @dfinity/identity-ledgerhq

export class LedgerIdentity extends SignIdentity {
  // TODO(L2-433): is there a better way to solve this requirements than a class variable that is set and unset?
  // A flag to signal that the next transaction to be signed will be a "stake neuron" transaction.
  private neuronStakeFlag = false;

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

  private static getTransport(): Promise<Transport> {
    return TransportWebHID.create();
  }

  private static async connect(): Promise<{
    app: LedgerApp;
    transport: Transport;
  }> {
    try {
      const transport = await this.getTransport();
      const app = new LedgerApp(transport);
      return { app, transport };
    } catch (err: unknown) {
      if (
        (err as LedgerHQTransportError)?.name === "TransportOpenUserCancelled"
      ) {
        throw new LedgerErrorKey("error__ledger.user_cancel");
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

  private static async fetchPublicKeyFromDevice({
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
  ): Promise<unknown> {
    /**
     * Convert the HttpAgentRequest body into cbor which can be signed by the Ledger Hardware Wallet.
     * @param request - body of the HttpAgentRequest
     */
    const prepareCborForLedger = (
      request: ReadRequest | CallRequest
    ): ArrayBuffer => Cbor.encode({ content: request });

    const { body, ...fields } = request;
    const signature = await this.sign(prepareCborForLedger(body));
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
