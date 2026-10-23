import { LedgerIdentity } from "$lib/identities/ledger.identity";
import { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { getRequestId } from "$lib/utils/ledger.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  fromHexString,
  rawPublicKeyHex,
} from "$tests/mocks/ledger.identity.mock";
import {
  Expiry,
  SubmitRequestType,
  requestIdOf,
  type Endpoint,
  type HttpAgentRequest,
  type ReadRequest,
  type ReadRequestType,
} from "@icp-sdk/core/agent";
import type { DiscoveredDevice } from "@ledgerhq/device-management-kit";
import type InternetComputerApp from "@zondax/ledger-icp";
import { LedgerError } from "@zondax/ledger-js";
import { NEVER, of, throwError } from "rxjs";
import { mock } from "vitest-mock-extended";

const mockDmk = vi.hoisted(() => ({
  isEnvironmentSupported: vi.fn(),
  listenToAvailableDevices: vi.fn(),
  startDiscovering: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("@ledgerhq/device-management-kit", () => ({
  DeviceManagementKitBuilder: class {
    addTransport() {
      return this;
    }
    build() {
      return mockDmk;
    }
  },
}));

vi.mock("@ledgerhq/device-transport-kit-web-hid", () => ({
  webHidTransportFactory: vi.fn(),
}));

describe("LedgerIdentity", () => {
  const mockLedgerApp = mock<InternetComputerApp>();

  const publicKey = Secp256k1PublicKey.fromRaw(fromHexString(rawPublicKeyHex));
  const callBody1 = {
    request_type: "call" as SubmitRequestType.Call,
    paths: [],
    canister_id: mockCanisterId,
    method_name: "get_balance",
    arg: new Uint8Array(new TextEncoder().encode("")),
    sender: mockPrincipal,
    ingress_expiry: Expiry.fromDeltaInMilliseconds(100000),
  };
  const mockHttpRequest1: HttpAgentRequest = {
    endpoint: "call" as Endpoint.Call,
    request: {},
    body: callBody1,
  };
  const requestId1 = requestIdOf(callBody1);
  const readStateBody1 = {
    request_type: "read_state" as ReadRequestType.ReadState,
    paths: [
      [new Uint8Array(new TextEncoder().encode("request_status")), requestId1],
    ],
    sender: mockPrincipal,
    ingress_expiry: Expiry.fromDeltaInMilliseconds(100000),
  };
  const mockReadStateRequest1: HttpAgentRequest = {
    endpoint: "read_state" as Endpoint.ReadState,
    request: {},
    body: readStateBody1,
  };

  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockLedgerApp.getAddressAndPubKey.mockResolvedValue({
      errorMessage: "No errors",
      returnCode: LedgerError.NoErrors,
      publicKey: Buffer.from(publicKey.toRaw()),
      principal: Buffer.from(mockPrincipal.toUint8Array()),
      address: Buffer.from(""),
      principalText: mockPrincipal.toText(),
    });
    vi.spyOn(LedgerIdentity, "connect").mockResolvedValue({
      app: mockLedgerApp,
      disconnect: vi.fn(),
    });
    vi.spyOn(LedgerIdentity, "fetchPublicKeyFromDevice").mockResolvedValue(
      publicKey
    );
    const callSignature = Buffer.alloc(64);
    const readStateSignature = Buffer.alloc(64);
    mockLedgerApp.signUpdateCall.mockResolvedValue({
      errorMessage: "No errors",
      returnCode: LedgerError.NoErrors,
      RequestHash: Buffer.from(""),
      RequestSignatureRS: callSignature,
      StatusReadHash: Buffer.from(""),
      StatusReadSignatureRS: readStateSignature,
    });

    mockLedgerApp.sign.mockResolvedValue({
      errorMessage: "No errors",
      returnCode: LedgerError.NoErrors,
      signatureRS: callSignature,
      preSignHash: Buffer.from(""),
      signatureDER: Buffer.from(""),
    });

    // Return at least a version bigger than ALL_CANDID_TXS_VERSION `2.4.9`.
    mockLedgerApp.getVersion.mockResolvedValue({
      errorMessage: "No errors",
      returnCode: LedgerError.NoErrors,
      major: 3,
      minor: 0,
      patch: 0,
      deviceLocked: false,
      targetId: "targetId",
      testMode: true,
    });
  });

  it("should not call to sign read state request after signing call request", async () => {
    const identity = await LedgerIdentity.create();

    const request = await identity.transformRequest(mockHttpRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(request.endpoint).toBe("call");

    const readRequest = await identity.transformRequest(mockReadStateRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(readRequest.endpoint).toBe("read_state");
  });

  it("should not call to sign read state request after signing call request if neuron flag is set", async () => {
    const identity = await LedgerIdentity.create();

    identity.flagUpcomingStakeNeuron();
    const request = await identity.transformRequest(mockHttpRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(mockLedgerApp.sign).toHaveBeenCalledTimes(0);
    expect(request.endpoint).toBe("call");

    const readRequest = await identity.transformRequest(mockReadStateRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(mockLedgerApp.sign).toHaveBeenCalledTimes(0);
    expect(readRequest.endpoint).toBe("read_state");
  });

  it("should sign new call requests", async () => {
    const identity = await LedgerIdentity.create();

    const request = await identity.transformRequest(mockHttpRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(request.endpoint).toBe("call");

    const request2 = await identity.transformRequest(mockHttpRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(2);
    expect(request2.endpoint).toBe("call");
  });

  it("should use sign new call requests", async () => {
    const identity = await LedgerIdentity.create();

    const request = await identity.transformRequest(mockHttpRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    expect(request.endpoint).toBe("call");

    const request2 = await identity.transformRequest(mockHttpRequest1);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(2);
    expect(request2.endpoint).toBe("call");
  });

  it("order of requests doesn't matter for read state caching", async () => {
    const callBody2 = {
      ...callBody1,
      method_name: "get_balance2",
    };
    const mockHttpRequest2: HttpAgentRequest = {
      endpoint: "call" as Endpoint.Call,
      request: {},
      body: callBody2,
    };
    const requestId2 = requestIdOf(callBody1);
    const mockReadStateRequest2: HttpAgentRequest = {
      endpoint: "read_state" as Endpoint.ReadState,
      request: {},
      body: {
        ...readStateBody1,
        paths: [
          [
            new Uint8Array(new TextEncoder().encode("request_status")),
            requestId2,
          ],
        ],
      },
    };
    const identity = await LedgerIdentity.create();

    // Two call requests before any read state
    await identity.transformRequest(mockHttpRequest1);
    await identity.transformRequest(mockHttpRequest2);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(2);

    // Read state for second call
    const readRequest2 = await identity.transformRequest(mockReadStateRequest2);
    expect(mockLedgerApp.sign).toHaveBeenCalledTimes(0);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(2);
    if (
      typeof readRequest2.body === "object" &&
      "content" in readRequest2.body
    ) {
      const body = readRequest2.body.content as ReadRequest;
      expect(getRequestId(body)).toEqual(requestId2);
    } else {
      expect.unreachable("To read request id from transformed request 2");
    }

    // Read state for first call
    const readRequest1 = await identity.transformRequest(mockReadStateRequest1);
    expect(mockLedgerApp.sign).toHaveBeenCalledTimes(0);
    expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(2);
    if (
      typeof readRequest1.body === "object" &&
      "content" in readRequest1.body
    ) {
      const body = readRequest1.body.content as ReadRequest;
      expect(getRequestId(body)).toEqual(requestId1);
    } else {
      expect.unreachable("To read request id from transformed request 1");
    }
  });

  describe("when the ledger app is exactly `ALL_CANDID_TXS_VERSION`", () => {
    it("should work as expected", async () => {
      mockLedgerApp.getVersion.mockResolvedValue({
        errorMessage: "No errors",
        returnCode: LedgerError.NoErrors,
        major: 2,
        minor: 4,
        patch: 9,
        deviceLocked: false,
        targetId: "targetId",
        testMode: true,
      });
      const identity = await LedgerIdentity.create();

      await identity.transformRequest(mockHttpRequest1);
      expect(mockLedgerApp.signUpdateCall).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the ledger app version is smaller than `ALL_CANDID_TXS_VERSION`", () => {
    it("should raise an error before signing", async () => {
      mockLedgerApp.getVersion.mockResolvedValue({
        errorMessage: "No errors",
        returnCode: LedgerError.NoErrors,
        major: 2,
        minor: 4,
        patch: 8,
        deviceLocked: false,
        targetId: "targetId",
        testMode: true,
      });

      const identity = await LedgerIdentity.create();

      const call = () => identity.transformRequest(mockHttpRequest1);
      await expect(call).rejects.toMatchObject({
        message: "error__ledger.app_version_not_supported",
        renderAsHtml: true,
      });
      expect(mockLedgerApp.signUpdateCall).not.toBeCalled();
    });

    it("should raise an error before signing a stake neuron call", async () => {
      mockLedgerApp.getVersion.mockResolvedValue({
        errorMessage: "No errors",
        returnCode: LedgerError.NoErrors,
        major: 2,
        minor: 4,
        patch: 8,
        deviceLocked: false,
        targetId: "targetId",
        testMode: true,
      });

      const identity = await LedgerIdentity.create();
      // The stake neuron uses a different path that signs also the read_state
      identity.flagUpcomingStakeNeuron();

      const call = () => identity.transformRequest(mockHttpRequest1);
      await expect(call).rejects.toMatchObject({
        message: "error__ledger.app_version_not_supported",
        renderAsHtml: true,
      });
      expect(mockLedgerApp.sign).not.toBeCalled();
    });
  });
});

describe("LedgerIdentity.connect", () => {
  const sessionId = "session-id";
  const device = { id: "device-id" } as DiscoveredDevice;

  beforeEach(() => {
    mockDmk.isEnvironmentSupported.mockReturnValue(true);
    mockDmk.listenToAvailableDevices.mockReturnValue(of([device]));
    mockDmk.startDiscovering.mockReturnValue(of(device));
    mockDmk.connect.mockResolvedValue(sessionId);
    mockDmk.disconnect.mockResolvedValue(undefined);
  });

  it("should connect to a device that the user already allowed", async () => {
    await LedgerIdentity.connect();

    expect(mockDmk.startDiscovering).not.toBeCalled();
    expect(mockDmk.connect).toBeCalledTimes(1);
    expect(mockDmk.connect).toBeCalledWith({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true },
    });
  });

  it("should ask the browser for a device if the user allowed no device", async () => {
    vi.useFakeTimers();
    mockDmk.listenToAvailableDevices.mockReturnValue(NEVER);

    const result = LedgerIdentity.connect();
    await vi.advanceTimersByTimeAsync(500);
    await result;

    expect(mockDmk.startDiscovering).toBeCalledTimes(1);
    expect(mockDmk.connect).toBeCalledWith({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true },
    });
  });

  it("should disconnect the session", async () => {
    const { disconnect } = await LedgerIdentity.connect();

    await disconnect();

    expect(mockDmk.disconnect).toBeCalledTimes(1);
    expect(mockDmk.disconnect).toBeCalledWith({ sessionId });
  });

  it("should raise an error if the browser does not support WebHID", async () => {
    mockDmk.isEnvironmentSupported.mockReturnValue(false);

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.browser_not_supported",
    });
    expect(mockDmk.connect).not.toBeCalled();
  });

  it("should raise an error if the user denies access to the device", async () => {
    vi.useFakeTimers();
    mockDmk.listenToAvailableDevices.mockReturnValue(NEVER);
    mockDmk.startDiscovering.mockReturnValue(
      throwError(() => ({ _tag: "NoAccessibleDeviceError" }))
    );

    const result = LedgerIdentity.connect();
    const assertion = expect(result).rejects.toMatchObject({
      message: "error__ledger.access_denied",
    });
    await vi.advanceTimersByTimeAsync(500);
    await assertion;
  });

  it("should raise an error if another application uses the device", async () => {
    mockDmk.connect.mockRejectedValue({ _tag: "ConnectionOpeningError" });

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.connect_many_apps",
    });
  });

  it("should raise an error if the device is gone", async () => {
    mockDmk.connect.mockRejectedValue({ _tag: "UnknownDeviceError" });

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.connect_no_device",
    });
  });
});
