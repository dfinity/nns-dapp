/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as api from "$lib/api/sns.api";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import { syncAccounts } from "$lib/services/accounts.services";
import * as services from "$lib/services/sns.services";
import { snsQueryStore } from "$lib/stores/sns.store";
import { AccountIdentifier, ICPToken, TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

const { participateInSwap, getSwapAccount } = services;

let testGetIdentityReturn = Promise.resolve(mockIdentity);
const setNoAccountIdentity = () =>
  (testGetIdentityReturn = Promise.reject(undefined));
const resetAccountIdentity = () =>
  (testGetIdentityReturn = Promise.resolve(mockIdentity));

jest.mock("$lib/services/accounts.services", () => {
  return {
    getAccountIdentity: jest
      .fn()
      .mockImplementation(() => testGetIdentityReturn),
    syncAccounts: jest.fn(),
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
    querySnsSwapStates[0].swap[0]!.params[0]!.max_participant_icp_e8s =
      BigInt(20_000_000_000);
    querySnsSwapStates[0].swap[0]!.params[0]!.min_participant_icp_e8s =
      BigInt(10_000_000);
    querySnsSwapStates[0].swap[0]!.params[0]!.max_icp_e8s =
      BigInt(200_000_000_000);

    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
      jest.clearAllMocks();
      snsQueryStore.reset();
    });

    it("should fetch swap state call api.participateInSnsSwap, sync accounts and return success true", async () => {
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const spyQueryState = jest
        .spyOn(api, "querySnsSwapState")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: TokenAmount.fromString({
          amount: "3",
          token: ICPToken,
        }) as TokenAmount,
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(true);
      expect(spyQueryState).toBeCalled();
      expect(spyParticipate).toBeCalled();
      expect(syncAccounts).toBeCalled();
    });

    it("should return true when last commitment and still sync accounts", async () => {
      const maxE8s = BigInt(1_000_000_000);
      const participationE8s = BigInt(150_000_000);
      const currentE8s = BigInt(850_000_000);
      const [metadatas, querySnsSwapStates] = snsResponsesForLifecycle({
        certified: true,
        lifecycles: [SnsSwapLifecycle.Open],
      });
      // Prepare project data
      querySnsSwapStates[0].derived[0]!.buyer_total_icp_e8s = currentE8s;
      querySnsSwapStates[0].swap[0]!.params[0]!.max_participant_icp_e8s =
        BigInt(20_000_000_000);
      querySnsSwapStates[0].swap[0]!.params[0]!.min_participant_icp_e8s =
        BigInt(10_000_000);
      querySnsSwapStates[0].swap[0]!.params[0]!.max_icp_e8s = maxE8s;
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() =>
          Promise.reject(
            new Error(
              "Sorry, There was an unexpected error while participating. Call was rejected: Request ID: a26e17bac91489a89f8b1aef858efeebe9993654ee1ace64efc46a60f3a219c8 Reject code: 5 Reject text: Canister tcvdh-niaaa-aaaaa-aaaoa-cai trapped explicitly: Panicked at 'The token amount can only be refreshed when the canister is in the OPEN state', sns/swap/canister/canister.rs:165:21"
            )
          )
        );
      const { success } = await participateInSwap({
        amount: TokenAmount.fromE8s({
          amount: participationE8s,
          token: ICPToken,
        }),
        rootCanisterId,
        account: mockMainAccount,
      });
      expect(success).toBe(true);
      expect(spyParticipate).toBeCalled();
      expect(syncAccounts).toBeCalled();
    });

    it("should return success false if api call fails", async () => {
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.reject(new Error("test")));
      const { success } = await participateInSwap({
        amount: TokenAmount.fromString({
          amount: "3",
          token: ICPToken,
        }) as TokenAmount,
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
      querySnsSwapStates[0].swap[0]!.params[0]!.max_participant_icp_e8s =
        BigInt(20_000_000_000);
      const minimumE8s = BigInt(10_000_000);
      querySnsSwapStates[0].swap[0]!.params[0]!.min_participant_icp_e8s =
        minimumE8s;
      querySnsSwapStates[0].swap[0]!.params[0]!.max_icp_e8s =
        BigInt(200_000_000_000);
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: TokenAmount.fromE8s({
          amount: minimumE8s - BigInt(10_000),
          token: ICPToken,
        }),
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
      querySnsSwapStates[0].swap[0]!.params[0]!.max_participant_icp_e8s =
        maximumE8s;
      querySnsSwapStates[0].swap[0]!.params[0]!.min_participant_icp_e8s =
        BigInt(10_000_000);
      querySnsSwapStates[0].swap[0]!.params[0]!.max_icp_e8s =
        BigInt(200_000_000_000);
      const rootCanisterId = Principal.fromText(metadatas[0].rootCanisterId);
      snsQueryStore.setData([metadatas, querySnsSwapStates]);
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: TokenAmount.fromE8s({
          amount: maximumE8s + BigInt(10_000),
          token: ICPToken,
        }),
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
        balance: TokenAmount.fromE8s({
          amount: BigInt(100_000_000),
          token: ICPToken,
        }),
      };
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: TokenAmount.fromE8s({
          amount:
            account.balance.toE8s() +
            BigInt(DEFAULT_TRANSACTION_FEE_E8S) +
            BigInt(10_000),
          token: ICPToken,
        }),
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
        amount: TokenAmount.fromString({
          amount: "3",
          token: ICPToken,
        }) as TokenAmount,
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
