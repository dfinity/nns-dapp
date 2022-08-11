/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AccountIdentifier, ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import * as api from "../../../lib/api/sns.api";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import * as services from "../../../lib/services/sns.services";
import { snsQueryStore } from "../../../lib/stores/sns.store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

const { participateInSwap, getSwapAccount } = services;

let testGetIdentityReturn = Promise.resolve(mockIdentity);
const setNoAccountIdentity = () =>
  (testGetIdentityReturn = Promise.reject(undefined));
const resetAccountIdentity = () =>
  (testGetIdentityReturn = Promise.resolve(mockIdentity));

jest.mock("../../../lib/services/accounts.services", () => {
  return {
    getAccountIdentity: jest
      .fn()
      .mockImplementation(() => testGetIdentityReturn),
  };
});

describe("sns-services", () => {
  describe("participateInSwap", () => {
    const [metadatas, querySnsSwapStates] = snsResponsesForLifecycle({
      certified: true,
      lifecycles: [SnsSwapLifecycle.Open],
    });
    // Prepare project data
    querySnsSwapStates[0].derived[0]!.buyer_total_icp_e8s = BigInt(0);
    querySnsSwapStates[0].swap[0]!.init[0]!.max_participant_icp_e8s =
      BigInt(20_000_000_000);
    querySnsSwapStates[0].swap[0]!.init[0]!.min_participant_icp_e8s =
      BigInt(10_000_000);
    querySnsSwapStates[0].swap[0]!.init[0]!.max_icp_e8s =
      BigInt(200_000_000_000);

    afterEach(() => {
      jest.clearAllMocks();
      snsQueryStore.reset();
    });

    it("should call api.participateInSnsSwap and return success true", async () => {
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromString("3") as ICP,
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(true);
      expect(spyParticipate).toBeCalled();
    });

    it("should return success false if api call fails", async () => {
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.reject(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromString("3") as ICP,
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(false);
      expect(spyParticipate).toBeCalled();
    });

    it("should return success false and not call api if amount lower than minimum", async () => {
      // Prepare data
      const [metadatas, querySnsSwapStates] = snsResponsesForLifecycle({
        certified: true,
        lifecycles: [SnsSwapLifecycle.Open],
      });
      querySnsSwapStates[0].swap[0]!.init[0]!.max_participant_icp_e8s =
        BigInt(20_000_000_000);
      const minimumE8s = BigInt(10_000_000);
      querySnsSwapStates[0].swap[0]!.init[0]!.min_participant_icp_e8s =
        minimumE8s;
      querySnsSwapStates[0].swap[0]!.init[0]!.max_icp_e8s =
        BigInt(200_000_000_000);
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromE8s(minimumE8s - BigInt(10_000)),
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(false);
      expect(spyParticipate).not.toBeCalled();
    });

    it("should return success false and not call api if amount higher than maximum", async () => {
      // Prepare data
      const [metadatas, querySnsSwapStates] = snsResponsesForLifecycle({
        certified: true,
        lifecycles: [SnsSwapLifecycle.Open],
      });
      const maximumE8s = BigInt(20_000_000_000);
      querySnsSwapStates[0].swap[0]!.init[0]!.max_participant_icp_e8s =
        maximumE8s;
      querySnsSwapStates[0].swap[0]!.init[0]!.min_participant_icp_e8s =
        BigInt(10_000_000);
      querySnsSwapStates[0].swap[0]!.init[0]!.max_icp_e8s =
        BigInt(200_000_000_000);
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromE8s(maximumE8s + BigInt(10_000)),
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(false);
      expect(spyParticipate).not.toBeCalled();
    });

    it("should return success false and not call api if not enough amount in account balance", async () => {
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const account = {
        ...mockMainAccount,
        balance: ICP.fromE8s(BigInt(100_000_000)),
      };
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromE8s(
          account.balance.toE8s() +
            BigInt(DEFAULT_TRANSACTION_FEE_E8S) +
            BigInt(10_000)
        ),
        rootCanisterId,
        account,
      });
      expect(success).toBe(false);
      expect(spyParticipate).not.toBeCalled();
    });

    it("should return success false if no identity", async () => {
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      setNoAccountIdentity();
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromString("3") as ICP,
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(false);
      expect(spyParticipate).not.toBeCalled();
      resetAccountIdentity();
    });
  });

  describe("getSwapAccount", () => {
    afterEach(() => jest.clearAllMocks());
    it("should return the swap canister account identifier", async () => {
      const account = await getSwapAccount(mockPrincipal);
      expect(account).toBeInstanceOf(AccountIdentifier);
    });
  });
});
