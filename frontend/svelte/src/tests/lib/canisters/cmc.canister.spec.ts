import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import { CMCCanister } from "../../../lib/canisters/cmc/cmc.canister";
import {
  CMCError,
  InvalidaTransactionError,
  ProcessingError,
  RefundedError,
  TransactionTooOldError,
} from "../../../lib/canisters/cmc/cmc.errors";
import type {
  IcpXdrConversionRateResponse,
  NotifyCreateCanisterResult,
  NotifyTopUpResult,
  _SERVICE as CMCService,
} from "../../../lib/canisters/cmc/cmc.types";
import { createAgent } from "../../../lib/utils/agent.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("CyclesMintingCanister", () => {
  const createCMC = async (service: CMCService) => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const canisterId = Principal.fromText("aaaaa-aa");

    return CMCCanister.create({
      agent: defaultAgent,
      serviceOverride: service,
      canisterId,
    });
  };

  describe("CMCCanister.getIcpToCyclesConversionRate", () => {
    it("returns the conversion rate from ICP to cycles", async () => {
      const response: IcpXdrConversionRateResponse = {
        certificate: [],
        data: {
          xdr_permyriad_per_icp: BigInt(10_000),
          timestamp_seconds: BigInt(10),
        },
        hash_tree: [],
      };
      const service = mock<CMCService>();
      service.get_icp_xdr_conversion_rate.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const res = await cmc.getIcpToCyclesConversionRate();

      expect(res).toEqual(BigInt(1_000_000_000_000));
    });
  });

  describe("CMCCanister.notifyCreateCanister", () => {
    it("returns principal of the new canister", async () => {
      const canisterId = Principal.fromText(
        "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
      );
      const response: NotifyCreateCanisterResult = {
        Ok: canisterId,
      };
      const service = mock<CMCService>();
      service.notify_create_canister.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const res = await cmc.notifyCreateCanister({
        controller: Principal.fromText("aaaaa-aa"),
        block_index: BigInt(10),
      });

      expect(res).toEqual(canisterId);
    });

    it("throws Refunded error", async () => {
      const response: NotifyCreateCanisterResult = {
        Err: { Refunded: { block_index: [], reason: "test" } },
      };
      const service = mock<CMCService>();
      service.notify_create_canister.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyCreateCanister({
          controller: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(RefundedError);
    });

    it("throws InvalidaTransactionError error", async () => {
      const response: NotifyCreateCanisterResult = {
        Err: { InvalidTransaction: "test" },
      };
      const service = mock<CMCService>();
      service.notify_create_canister.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyCreateCanister({
          controller: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(InvalidaTransactionError);
    });

    it("throws ProcessingError error", async () => {
      const response: NotifyCreateCanisterResult = {
        Err: { Processing: null },
      };
      const service = mock<CMCService>();
      service.notify_create_canister.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyCreateCanister({
          controller: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(ProcessingError);
    });

    it("throws TransactionTooOldError error", async () => {
      const response: NotifyCreateCanisterResult = {
        Err: { TransactionTooOld: BigInt(10) },
      };
      const service = mock<CMCService>();
      service.notify_create_canister.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyCreateCanister({
          controller: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(TransactionTooOldError);
    });

    it("throws CMCError error", async () => {
      const response: NotifyCreateCanisterResult = {
        Err: { Other: { error_code: BigInt(10), error_message: "test" } },
      };
      const service = mock<CMCService>();
      service.notify_create_canister.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyCreateCanister({
          controller: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(CMCError);
    });
  });

  describe("CMCCanister.notifyTopUp", () => {
    it("successfully notifies top up", async () => {
      const response: NotifyTopUpResult = {
        Ok: BigInt(10),
      };
      const service = mock<CMCService>();
      service.notify_top_up.mockResolvedValue(response);

      const cmc = await createCMC(service);

      await cmc.notifyTopUp({
        canister_id: Principal.fromText("aaaaa-aa"),
        block_index: BigInt(10),
      });

      expect(service.notify_top_up).toBeCalled();
    });

    it("throws Refunded error", async () => {
      const response: NotifyTopUpResult = {
        Err: { Refunded: { block_index: [], reason: "test" } },
      };
      const service = mock<CMCService>();
      service.notify_top_up.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyTopUp({
          canister_id: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(RefundedError);
    });

    it("throws InvalidaTransactionError error", async () => {
      const response: NotifyTopUpResult = {
        Err: { InvalidTransaction: "test" },
      };
      const service = mock<CMCService>();
      service.notify_top_up.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyTopUp({
          canister_id: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(InvalidaTransactionError);
    });

    it("throws ProcessingError error", async () => {
      const response: NotifyTopUpResult = {
        Err: { Processing: null },
      };
      const service = mock<CMCService>();
      service.notify_top_up.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyTopUp({
          canister_id: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(ProcessingError);
    });

    it("throws TransactionTooOldError error", async () => {
      const response: NotifyTopUpResult = {
        Err: { TransactionTooOld: BigInt(10) },
      };
      const service = mock<CMCService>();
      service.notify_top_up.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyTopUp({
          canister_id: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(TransactionTooOldError);
    });

    it("throws CMCError error", async () => {
      const response: NotifyTopUpResult = {
        Err: { Other: { error_code: BigInt(10), error_message: "test" } },
      };
      const service = mock<CMCService>();
      service.notify_top_up.mockResolvedValue(response);

      const cmc = await createCMC(service);

      const call = () =>
        cmc.notifyTopUp({
          canister_id: Principal.fromText("aaaaa-aa"),
          block_index: BigInt(10),
        });

      expect(call).rejects.toThrowError(CMCError);
    });
  });
});
