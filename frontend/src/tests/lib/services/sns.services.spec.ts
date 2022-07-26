import { ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import * as api from "../../../lib/api/sns.api";
import * as services from "../../../lib/services/sns.services";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsSwapCommitment } from "../../mocks/sns-projects.mock";

const { participateInSwap } = services;

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
    const spyQuery = jest
      .spyOn(api, "querySnsSwapCommitment")
      .mockImplementation(() =>
        Promise.resolve(mockSnsSwapCommitment(Principal.fromText("aaaaa-aa")))
      );
    afterEach(() => jest.clearAllMocks());
    it("should call api.participateInSnsSwap and return success true", async () => {
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromString("3") as ICP,
        rootCanisterId: mockPrincipal,
        account: mockMainAccount,
      });
      expect(success).toBe(true);
      expect(spyParticipate).toBeCalled();
      expect(spyQuery).toBeCalled();
    });

    it("should return success false if api call fails", async () => {
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.reject(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromString("3") as ICP,
        rootCanisterId: mockPrincipal,
        account: mockMainAccount,
      });
      expect(success).toBe(false);
      expect(spyParticipate).toBeCalled();
      expect(spyQuery).not.toBeCalled();
    });

    it("should return success false if no identity", async () => {
      setNoAccountIdentity();
      const spyParticipate = jest
        .spyOn(api, "participateInSnsSwap")
        .mockImplementation(() => Promise.resolve(undefined));
      const { success } = await participateInSwap({
        amount: ICP.fromString("3") as ICP,
        rootCanisterId: mockPrincipal,
        account: mockMainAccount,
      });
      expect(success).toBe(false);
      expect(spyParticipate).not.toBeCalled();
      expect(spyQuery).not.toBeCalled();
      resetAccountIdentity();
    });
  });
});
