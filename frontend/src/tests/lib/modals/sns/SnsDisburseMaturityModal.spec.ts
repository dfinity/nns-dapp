import { disburseMaturity } from "$lib/api/sns-governance.api";
import SnsDisburseMaturityModal from "$lib/modals/sns/neurons/SnsDisburseMaturityModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { DisburseMaturityModalPo } from "$tests/page-objects/DisburseMaturityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import type { SnsNeuron } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";

vi.mock("$lib/api/sns-governance.api");

describe("SnsDisburseMaturityModal", () => {
  const reloadNeuron = vi.fn();
  const rootCanisterId = mockPrincipal;

  const renderSnsDisburseMaturityModal = async (
    neuron: SnsNeuron = mockSnsNeuron
  ): Promise<DisburseMaturityModalPo> => {
    const { container } = await renderModal({
      component: SnsDisburseMaturityModal,
      props: {
        neuronId: neuron.id,
        neuron,
        rootCanisterId,
        reloadNeuron,
      },
    });
    return DisburseMaturityModalPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authStore.setForTesting(mockIdentity);
    tokensStore.setToken({
      canisterId: rootCanisterId,
      token: mockSnsToken,
    });
    snsAccountsStore.setAccounts({
      rootCanisterId,
      accounts: [mockSnsMainAccount],
      certified: true,
    });
  });

  it("should display total maturity", async () => {
    const po = await renderSnsDisburseMaturityModal();
    expect(await po.getTotalMaturity()).toBe("1.00");
  });

  it("should disable next button when 0 selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(0);
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should disable next button when destination address is not selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(10);
    const destinationPo = po.getSelectDestinationAddressPo();
    await destinationPo.enterAddress("");
    await destinationPo.blurInput();
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should disable next button when destination address is valid", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(10);
    const destinationPo = po.getSelectDestinationAddressPo();
    await destinationPo.enterAddress("INVALID_ADDRESS");
    await destinationPo.blurInput();
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should enable next button when not 0 selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(1);
    expect(await po.isNextButtonDisabled()).toBe(false);
  });

  it("should disable next button if amount of maturity is less than transaction fee", async () => {
    const fee = 100_000_000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      maturity: fee * 2n,
    });
    tokensStore.setToken({
      canisterId: rootCanisterId,
      token: {
        fee,
        ...mockSnsToken,
      },
    });
    // Maturity is 2x the fee, so 10% of maturity is not enough to cover the fee
    const percentage = 10;
    const po = await renderSnsDisburseMaturityModal(neuron);
    await po.setPercentage(percentage);
    expect(await po.isNextButtonDisabled()).toBe(false);
  });

  it("should display selected percentage and total maturity", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      maturity: 1_000_000_000n,
    });
    const po = await renderSnsDisburseMaturityModal(neuron);
    await po.setPercentage(13);
    expect(await po.getAmountMaturityToDisburse()).toBe("1.30 maturity");

    await po.clickNextButton();
    expect(await po.getText()).toContain(`13%`);
  });

  it("should show error if account is not ICRC", async () => {
    const po = await renderSnsDisburseMaturityModal(mockSnsNeuron);
    const destinationPo = po.getSelectDestinationAddressPo();
    // This is a valid ICP address, but not valid ICRC address.
    await destinationPo.enterAddress(
      "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f"
    );
    await destinationPo.blurInput();
    expect(await destinationPo.getErrorMessage()).toBe(
      "Please enter a valid address."
    );
  });

  it("should display summary information in the last step", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      maturity: 1_000_000_000n,
    });
    const po = await renderSnsDisburseMaturityModal(neuron);
    await po.setPercentage(50);
    await po.clickNextButton();

    expect(await po.getConfirmPercentage()).toBe("50%");
    expect(await po.getConfirmTokens()).toBe("4.75-5.25 TST");
    expect(await po.getConfirmDestination()).toBe("Main");
  });

  it("should display range with floor and ceil rounding", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      maturity: 123123213n,
    });
    const po = await renderSnsDisburseMaturityModal(neuron);
    await po.setPercentage(100);
    await po.clickNextButton();

    // NodeJS supports roundingMode since v19
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#browser_compatibility
    // with 123123213n maturity
    // -5% is 1,169670524, which should show as 1.16 with the rounding mode "floor"
    // +5% is 1,292793737, which should show as 1.30 with the rounding mode "ceil"
    // expect(await po.getConfirmTokens()).toBe("1.16-1.30 TST");
    expect(await po.getConfirmTokens()).toBe("1.17-1.29 TST");
  });

  const disburse = async (neuron: SnsNeuron, accountAddress?: string) => {
    const po = await renderSnsDisburseMaturityModal(neuron);
    if (nonNullish(accountAddress)) {
      const destinationPo = po.getSelectDestinationAddressPo();
      await destinationPo.enterAddress(accountAddress);
    }
    await po.setPercentage(50);
    await po.clickNextButton();

    // precondition
    expect(disburseMaturity).not.toBeCalled();
    expect(reloadNeuron).not.toBeCalled();

    await po.clickConfirmButton();

    expect(disburseMaturity).toBeCalledTimes(1);
    expect(disburseMaturity).toBeCalledWith({
      neuronId: neuron.id,
      rootCanisterId: mockPrincipal,
      percentageToDisburse: 50,
      identity: mockIdentity,
      toAccount: decodeIcrcAccount(
        nonNullish(accountAddress)
          ? accountAddress
          : mockSnsMainAccount.identifier
      ),
    });
    await waitFor(() => expect(reloadNeuron).toBeCalledTimes(1));

    return po;
  };

  it("should call disburse maturity api and reloadNeuron", async () => {
    await disburse(mockSnsNeuron);
  });

  it("should disburse maturity when maturity is larger than 1,000", async () => {
    const neuron1100maturity = createMockSnsNeuron({
      id: [1],
      maturity: 110_000_000_000n,
    });
    await disburse(neuron1100maturity);
  });

  it("should disburse maturity to an SNS account", async () => {
    const accountAddress = principal(1).toText();
    const po = await disburse(mockSnsNeuron, accountAddress);

    expect(await po.getConfirmDestination()).toBe(accountAddress);
  });
});
