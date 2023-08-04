import { LedgerIdentity } from "$lib/identities/ledger.identity";
import { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  fromHexString,
  rawPublicKeyHex,
} from "$tests/mocks/ledger.identity.mock";
import {
  Expiry,
  SubmitRequestType,
  type Endpoint,
  type HttpAgentRequest,
  type ReadRequestType,
} from "@dfinity/agent";
import type TransportWebHID from "@ledgerhq/hw-transport-webhid";
import type InternetComputerApp from "@zondax/ledger-icp";
import { LedgerError } from "@zondax/ledger-icp";
import { mock } from "jest-mock-extended";

describe("LedgerIdentity", () => {
  const mockLedgerApp = mock<InternetComputerApp>();
  const mockTransport = mock<TransportWebHID>();

  const publicKey = Secp256k1PublicKey.fromRaw(fromHexString(rawPublicKeyHex));
  const mockHttpRequest: HttpAgentRequest = {
    endpoint: "call" as Endpoint.Call,
    request: {},
    body: {
      request_type: "call" as SubmitRequestType.Call,
      paths: [],
      canister_id: mockCanisterId,
      method_name: "get_balance",
      arg: new TextEncoder().encode(""),
      sender: mockPrincipal,
      ingress_expiry: new Expiry(100000),
    },
  };
  const mockReadStateRequest: HttpAgentRequest = {
    endpoint: "read_state" as Endpoint.ReadState,
    request: {},
    body: {
      request_type: "read_state" as ReadRequestType.ReadState,
      paths: [],
      method_name: "get_balance",
      arg: new TextEncoder().encode(""),
      sender: mockPrincipal,
      ingress_expiry: new Expiry(100000),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLedgerApp.getAddressAndPubKey.mockResolvedValue({
      errorMessage: undefined,
      returnCode: LedgerError.NoErrors,
      publicKey: Buffer.from(publicKey.toRaw()),
      principal: Buffer.from(mockPrincipal.toUint8Array()),
      address: Buffer.from(""),
      principalText: mockPrincipal.toText(),
    });
    jest.spyOn(LedgerIdentity, "connect").mockResolvedValue({
      app: mockLedgerApp,
      transport: mockTransport,
    });
    jest
      .spyOn(LedgerIdentity, "fetchPublicKeyFromDevice")
      .mockResolvedValue(publicKey);
    const callSignature = Buffer.alloc(64);
    const readStateSignature = Buffer.alloc(64);

    mockLedgerApp.signUpdateCall.mockResolvedValue({
      errorMessage: undefined,
      returnCode: LedgerError.NoErrors,
      RequestHash: Buffer.from(""),
      RequestSignatureRS: callSignature,
      StatusReadHash: Buffer.from(""),
      StatusReadSignatureRS: readStateSignature,
    });

    mockLedgerApp.sign.mockResolvedValue({
      errorMessage: undefined,
      returnCode: LedgerError.NoErrors,
      signatureRS: callSignature,
      preSignHash: Buffer.from(""),
      signatureDER: Buffer.from(""),
    });
  });

  it("should not call to sign read state request after signing call request", async () => {
    const identity = await LedgerIdentity.create();

    const request = await identity.transformRequest(mockHttpRequest);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(request.endpoint).toBe("call");

    const readRequest = await identity.transformRequest(mockReadStateRequest);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(readRequest.endpoint).toBe("read_state");
    identity.clearInstanceVariablesForTesting();
  });

  it("should call to sign read state request after signing call request if neuron flag is set", async () => {
    const identity = await LedgerIdentity.create();

    identity.flagUpcomingStakeNeuron();
    const request = await identity.transformRequest(mockHttpRequest);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(0);
    expect(mockLedgerApp.sign).toHaveBeenCalledTimes(1);
    expect(request.endpoint).toBe("call");

    const readRequest = await identity.transformRequest(mockReadStateRequest);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(0);
    expect(mockLedgerApp.sign).toHaveBeenCalledTimes(2);
    expect(readRequest.endpoint).toBe("read_state");
    identity.clearInstanceVariablesForTesting();
  });

  it("should sign new call requests", async () => {
    const identity = await LedgerIdentity.create();

    const request = await identity.transformRequest(mockHttpRequest);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(request.endpoint).toBe("call");

    const request2 = await identity.transformRequest(mockHttpRequest);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(2);
    expect(request2.endpoint).toBe("call");
    identity.clearInstanceVariablesForTesting();
  });
});
