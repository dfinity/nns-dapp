import { LedgerIdentity } from "$lib/identities/ledger.identity";
import { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
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
import {
  DeviceNotRecognizedError,
  NoAccessibleDeviceError,
  OpeningConnectionError,
  UnknownDeviceError,
  type DiscoveredDevice,
} from "@ledgerhq/device-management-kit";
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
  listConnectedDevices: vi.fn(),
}));

// Keep the real error classes. The tests raise them the way the DMK does.
vi.mock("@ledgerhq/device-management-kit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@ledgerhq/device-management-kit")>()),
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
      release: vi.fn(),
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
  const device = { id: "device-id" } as DiscoveredDevice;
  // The session lives in module state, so each test uses a new session id.
  let sessionCount = 0;
  let sessionId: string;

  beforeEach(() => {
    sessionCount += 1;
    sessionId = `session-${sessionCount}`;

    mockDmk.isEnvironmentSupported.mockReturnValue(true);
    // The DMK emits the devices it knows at once, and the devices that the browser lists after it asks the browser.
    mockDmk.listenToAvailableDevices.mockReturnValue(of([], [device]));
    mockDmk.startDiscovering.mockReturnValue(of(device));
    mockDmk.connect.mockResolvedValue(sessionId);
    mockDmk.disconnect.mockResolvedValue(undefined);
    mockDmk.listConnectedDevices.mockImplementation(() => [{ sessionId }]);
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

  it("should not wait for the known devices if the DMK lists them late", async () => {
    vi.useFakeTimers();
    // The DMK already knows the device from an earlier call. The browser confirms it later.
    mockDmk.listenToAvailableDevices.mockReturnValue(of([device], [device]));

    await LedgerIdentity.connect();

    expect(mockDmk.startDiscovering).not.toBeCalled();
    expect(mockDmk.connect).toBeCalledTimes(1);
  });

  it("should ask the browser for a device if the user allowed no device", async () => {
    mockDmk.listenToAvailableDevices.mockReturnValue(of([], []));

    await LedgerIdentity.connect();

    expect(mockDmk.startDiscovering).toBeCalledTimes(1);
    expect(mockDmk.connect).toBeCalledWith({
      device,
      sessionRefresherOptions: { isRefresherDisabled: true },
    });
  });

  it("should ask the browser for a device if the DMK lists no devices in time", async () => {
    vi.useFakeTimers();
    mockDmk.listenToAvailableDevices.mockReturnValue(NEVER);

    const result = LedgerIdentity.connect();
    await vi.advanceTimersByTimeAsync(4_999);
    expect(mockDmk.startDiscovering).not.toBeCalled();

    await vi.advanceTimersByTimeAsync(1);
    await result;

    expect(mockDmk.startDiscovering).toBeCalledTimes(1);
  });

  it("should share one session between concurrent operations", async () => {
    vi.useFakeTimers();

    const [first, second] = await Promise.all([
      LedgerIdentity.connect(),
      LedgerIdentity.connect(),
    ]);
    expect(mockDmk.connect).toBeCalledTimes(1);

    first.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mockDmk.disconnect).not.toBeCalled();

    second.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mockDmk.disconnect).toBeCalledTimes(1);
    expect(mockDmk.disconnect).toBeCalledWith({ sessionId });
  });

  it("should reuse the session for operations that follow each other", async () => {
    vi.useFakeTimers();

    const first = await LedgerIdentity.connect();
    first.release();
    const second = await LedgerIdentity.connect();
    second.release();

    expect(mockDmk.connect).toBeCalledTimes(1);
    expect(mockDmk.disconnect).not.toBeCalled();
  });

  it("should disconnect when the session is idle", async () => {
    vi.useFakeTimers();

    const { release } = await LedgerIdentity.connect();
    release();

    await vi.advanceTimersByTimeAsync(4_999);
    expect(mockDmk.disconnect).not.toBeCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(mockDmk.disconnect).toBeCalledTimes(1);
    expect(mockDmk.disconnect).toBeCalledWith({ sessionId });
  });

  it("should not disconnect while an operation uses the session", async () => {
    vi.useFakeTimers();

    const first = await LedgerIdentity.connect();
    const second = await LedgerIdentity.connect();
    first.release();

    await vi.advanceTimersByTimeAsync(5_000);
    expect(mockDmk.disconnect).not.toBeCalled();

    second.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mockDmk.disconnect).toBeCalledTimes(1);
  });

  it("should connect again if the device disconnected", async () => {
    vi.useFakeTimers();

    const first = await LedgerIdentity.connect();
    first.release();
    mockDmk.listConnectedDevices.mockReturnValue([]);
    await LedgerIdentity.connect();

    expect(mockDmk.connect).toBeCalledTimes(2);
  });

  it("should not count the release of a closed session against the new session", async () => {
    vi.useFakeTimers();
    const closedSessionId = sessionId;
    const newSessionId = `${sessionId}-new`;

    const first = await LedgerIdentity.connect();
    // The device disconnects while the first operation runs.
    mockDmk.listConnectedDevices.mockReturnValue([]);
    mockDmk.connect.mockResolvedValue(newSessionId);
    const second = await LedgerIdentity.connect();
    expect(mockDmk.connect).toBeCalledTimes(2);

    first.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mockDmk.disconnect).not.toBeCalled();

    second.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(mockDmk.disconnect).toBeCalledTimes(1);
    expect(mockDmk.disconnect).toBeCalledWith({ sessionId: newSessionId });
    expect(mockDmk.disconnect).not.toBeCalledWith({
      sessionId: closedSessionId,
    });
  });

  it("should connect again after a failed connect", async () => {
    mockDmk.connect.mockRejectedValueOnce(new UnknownDeviceError("gone"));

    await expect(LedgerIdentity.connect()).rejects.toBeInstanceOf(
      LedgerErrorKey
    );
    await LedgerIdentity.connect();

    expect(mockDmk.connect).toBeCalledTimes(2);
  });

  it("should raise an error if the browser does not support WebHID", async () => {
    mockDmk.isEnvironmentSupported.mockReturnValue(false);

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.browser_not_supported",
    });
    expect(mockDmk.connect).not.toBeCalled();
  });

  it("should raise an error if the user denies access to the device", async () => {
    mockDmk.listenToAvailableDevices.mockReturnValue(of([], []));
    mockDmk.startDiscovering.mockReturnValue(
      throwError(() => new NoAccessibleDeviceError("No selected device"))
    );

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.access_denied",
    });
  });

  it("should raise an error if another application uses the device", async () => {
    mockDmk.connect.mockRejectedValue(
      new OpeningConnectionError(new Error("Failed to open the device"))
    );

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.connect_many_apps",
    });
  });

  it("should raise an error if the device is gone", async () => {
    mockDmk.connect.mockRejectedValue(
      new UnknownDeviceError("Unknown device device-id")
    );

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: "error__ledger.connect_no_device",
    });
  });

  it("should raise an error with the DMK error text for other DMK errors", async () => {
    mockDmk.connect.mockRejectedValue(
      new DeviceNotRecognizedError("Device not recognized: 0x1234")
    );

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: expect.stringContaining("Device not recognized: 0x1234"),
    });
    await expect(LedgerIdentity.connect()).rejects.not.toMatchObject({
      message: expect.stringContaining("[object Object]"),
    });
  });

  it("should raise an error with the error text for other errors", async () => {
    mockDmk.connect.mockRejectedValue(new Error("Boom"));

    await expect(LedgerIdentity.connect()).rejects.toMatchObject({
      message: expect.stringContaining("Error: Boom"),
    });
  });
});
