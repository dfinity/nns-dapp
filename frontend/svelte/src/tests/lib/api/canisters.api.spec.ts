import { ICP, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import {
  createCanister,
  queryCanisterDetails,
  queryCanisters,
  topUpCanister,
} from "../../../lib/api/canisters.api";
import { CMCCanister } from "../../../lib/canisters/cmc/cmc.canister";
import { ICManagementCanister } from "../../../lib/canisters/ic-management/ic-management.canister";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCanisterDetails } from "../../mocks/canisters.mock";

describe("canisters-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();
  const mockCMCCanister = mock<CMCCanister>();
  const mockICManagementCanister = mock<ICManagementCanister>();
  const mockLedgerCanister = mock<LedgerCanister>();
  let spyGetCanisters;

  beforeEach(() => {
    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    jest.spyOn(CMCCanister, "create").mockImplementation(() => mockCMCCanister);

    jest
      .spyOn(ICManagementCanister, "create")
      .mockImplementation(() => mockICManagementCanister);

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mockLedgerCanister);

    spyGetCanisters = jest
      .spyOn(mockNNSDappCanister, "getCanisters")
      .mockResolvedValue([]);
  });

  describe("queryCanisters", () => {
    afterEach(() => jest.clearAllMocks());
    it("should call the canister to list the canisters 🤪", async () => {
      await queryCanisters({ identity: mockIdentity, certified: true });

      expect(spyGetCanisters).toHaveReturnedTimes(1);
    });
  });

  describe("queryCanisterDetails", () => {
    it("should call IC Management Canister with canister id", async () => {
      mockICManagementCanister.getCanisterDetails.mockResolvedValue(
        mockCanisterDetails
      );

      const response = await queryCanisterDetails({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
      });
      expect(mockICManagementCanister.getCanisterDetails).toBeCalledWith(
        mockCanisterDetails.id
      );
      expect(response).toEqual(mockCanisterDetails);
    });
  });

  describe("createCanister", () => {
    beforeEach(() => jest.clearAllMocks());
    it("should make a transfer, notify and attach the canister", async () => {
      mockLedgerCanister.transfer.mockResolvedValue(BigInt(10));
      mockCMCCanister.notifyCreateCanister.mockResolvedValue(
        mockCanisterDetails.id
      );

      const response = await createCanister({
        identity: mockIdentity,
        amount: ICP.fromString("3") as ICP,
      });
      expect(mockLedgerCanister.transfer).toBeCalled();
      expect(mockCMCCanister.notifyCreateCanister).toBeCalled();
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        name: "",
        canisterId: mockCanisterDetails.id,
      });
      expect(response).toEqual(mockCanisterDetails.id);
    });

    it("should not attach canister, nor notify if transfer fails", async () => {
      mockLedgerCanister.transfer.mockRejectedValue(new Error());

      const call = () =>
        createCanister({
          identity: mockIdentity,
          amount: ICP.fromString("3") as ICP,
        });
      expect(call).rejects.toThrow();
      expect(mockCMCCanister.notifyCreateCanister).not.toBeCalled();
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
    });
  });

  describe("topUpCanister", () => {
    beforeEach(() => jest.clearAllMocks());
    it("should make a transfer and notify", async () => {
      mockLedgerCanister.transfer.mockResolvedValue(BigInt(10));
      mockCMCCanister.notifyCreateCanister.mockResolvedValue(
        mockCanisterDetails.id
      );

      await topUpCanister({
        identity: mockIdentity,
        amount: ICP.fromString("3") as ICP,
        canisterPrincipal: mockCanisterDetails.id,
      });
      expect(mockLedgerCanister.transfer).toBeCalled();
      expect(mockCMCCanister.notifyTopUp).toBeCalled();
    });

    it("should not notify if transfer fails", async () => {
      mockLedgerCanister.transfer.mockRejectedValue(new Error());

      const call = () =>
        topUpCanister({
          identity: mockIdentity,
          amount: ICP.fromString("3") as ICP,
          canisterPrincipal: mockCanisterDetails.id,
        });
      expect(call).rejects.toThrow();
      expect(mockCMCCanister.notifyTopUp).not.toBeCalled();
    });
  });
});
