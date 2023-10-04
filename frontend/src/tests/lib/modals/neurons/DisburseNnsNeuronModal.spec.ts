/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { disburse } from "$lib/services/neurons.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { DisburseNnsNeuronModalPo } from "$tests/page-objects/DisburseNnsNeuronModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/icp-ledger.api");
jest.mock("$lib/services/neurons.services", () => {
  return {
    disburse: jest.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
  };
});

describe("DisburseNnsNeuronModal", () => {
  beforeEach(() => {
    resetIdentity();
    cancelPollAccounts();
  });

  const renderDisburseModal = async (
    neuron: NeuronInfo
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: DisburseNnsNeuronModal,
      props: { neuron },
    });
  };

  const renderComponent = async (neuron: NeuronInfo) => {
    const { container } = await renderDisburseModal(neuron);
    return DisburseNnsNeuronModalPo.under(new JestPageObjectElement(container));
  };

  describe("when accounts are loaded", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        subAccounts: [mockSubAccount],
      });
    });

    it("should display modal", async () => {
      const po = await renderComponent(mockNeuron);

      expect(await po.isPresent()).toBe(true);
    });

    it("should render accounts", async () => {
      const po = await renderComponent(mockNeuron);

      const options = await po.getNnsDestinationAddressPo().getOptions();
      expect(options).toEqual(["Main", "test subaccount"]);
    });

    it("should be able to select an account", async () => {
      const po = await renderComponent(mockNeuron);

      const options = await po.getNnsDestinationAddressPo().getOptions();
      expect(options).toEqual(["Main", "test subaccount"]);

      expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(false);
      await po
        .getNnsDestinationAddressPo()
        .getSelectDestinationAddressPo()
        .selectAccount("Main");
      await po.getNnsDestinationAddressPo().clickContinue();
      expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(true);
    });

    it("should be able to add address in input", async () => {
      const po = await renderComponent(mockNeuron);
      const destinationPo = po.getNnsDestinationAddressPo();

      const address = mockMainAccount.identifier;
      await destinationPo.enterAddress(address);

      expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(false);
      await destinationPo.clickContinue();
      expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(true);
    });

    it("should call disburse service", async () => {
      const po = await renderComponent(mockNeuron);
      const destinationPo = po.getNnsDestinationAddressPo();

      const address = mockMainAccount.identifier;
      await destinationPo.enterAddress(address);

      await destinationPo.clickContinue();

      expect(disburse).not.toBeCalled();
      expect(get(pageStore).path).not.toEqual(AppPath.Neurons);

      await po.getConfirmDisburseNeuronPo().clickConfirm();

      expect(disburse).toBeCalled();
      expect(get(pageStore).path).toEqual(AppPath.Neurons);
    });
  });

  describe("when accounts store is empty", () => {
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
    });

    it("should fetch accounts and render account selector", async () => {
      const mainBalanceE8s = BigInt(10_000_000);
      let resolveQueryAccount;
      const queryAccountPromise = new Promise<AccountDetails>((resolve) => {
        resolveQueryAccount = () => resolve(mockAccountDetails);
      });

      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockReturnValue(queryAccountPromise);

      const po = await renderComponent(mockNeuron);

      await runResolvedPromises();
      expect(
        await po
          .getNnsDestinationAddressPo()
          .getSelectDestinationAddressPo()
          .getDropdownPo()
          .isPresent()
      ).toBe(false);

      resolveQueryAccount();
      await runResolvedPromises();
      expect(
        await po
          .getNnsDestinationAddressPo()
          .getSelectDestinationAddressPo()
          .getDropdownPo()
          .isPresent()
      ).toBe(true);
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: jest.SpyInstance;
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      jest.clearAllTimers();
      jest.clearAllMocks();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spyQueryAccount = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should stop polling", async () => {
      const { unmount } = await renderDisburseModal(mockNeuron);

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);

      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const callsBeforeLeaving = 3;
      while (expectedCalls < callsBeforeLeaving) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
      }
      unmount();

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
    });
  });
});
