import { AddressBookSelectPo } from "$tests/page-objects/AddressBookSelect.page-object";
import { AmountInputPo } from "$tests/page-objects/AmountInput.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SelectDestinationAddressPo } from "$tests/page-objects/SelectDestinationAddress.page-object";
import { TransactionFormFeePo } from "$tests/page-objects/TransactionFormFee.page-object";
import { TransactionFromAccountPo } from "$tests/page-objects/TransactionFromAccount.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionFormPo extends BasePageObject {
  private static readonly TID = "transaction-step-1";

  static under(element: PageObjectElement): TransactionFormPo {
    return new TransactionFormPo(element.byTestId(TransactionFormPo.TID));
  }

  getTransactionFromAccountPo(): TransactionFromAccountPo {
    return TransactionFromAccountPo.under(this.root);
  }

  getTransactionFormFeePo(): TransactionFormFeePo {
    return TransactionFormFeePo.under(this.root);
  }

  getSourceAccounts(): Promise<string[]> {
    return this.getTransactionFromAccountPo().getAccounts();
  }

  getSelectDestinationAddressPo(): SelectDestinationAddressPo {
    return SelectDestinationAddressPo.under(this.root);
  }

  getAmountInputPo(): AmountInputPo {
    return AmountInputPo.under(this.root);
  }

  getContinueButtonPo(): ButtonPo {
    return this.getButton("transaction-button-next");
  }

  enterAmount(amount: number): Promise<void> {
    return this.getAmountInputPo().enterAmount(amount);
  }

  async isContinueButtonEnabled(): Promise<boolean> {
    return !(await this.getContinueButtonPo().isDisabled());
  }

  clickContinue(): Promise<void> {
    return this.getContinueButtonPo().click();
  }

  enterAddress(address: string): Promise<void> {
    return this.getSelectDestinationAddressPo().enterAddress(address);
  }

  async transferToAccount({
    accountName,
    amount,
  }: {
    accountName: string;
    amount: number;
  }): Promise<void> {
    await this.getSelectDestinationAddressPo().selectAccount(accountName);
    await this.enterAmount(amount);
    await this.clickContinue();
  }

  async transferToAddress({
    destinationAddress,
    amount,
  }: {
    destinationAddress: string;
    amount: number;
  }): Promise<void> {
    await this.enterAddress(destinationAddress);
    await this.enterAmount(amount);
    await this.clickContinue();
  }

  // Address book methods
  getAddressBookSelectPo(): AddressBookSelectPo {
    return AddressBookSelectPo.under(this.root);
  }

  async isAddressBookToggleEnabled(): Promise<boolean> {
    const toggle = this.root.querySelector(
      'input[aria-label="Use address book"]'
    );
    return (await toggle.getAttribute("disabled")) === null;
  }

  async isAddressBookToggleChecked(): Promise<boolean> {
    const toggle = this.root.querySelector(
      'input[aria-label="Use address book"]'
    );
    return toggle.isChecked();
  }

  async toggleAddressBook(): Promise<void> {
    const toggle = this.root.querySelector(
      'input[aria-label="Use address book"]'
    );
    await toggle.click();
  }

  async transferToAddressBookEntry({
    nickname,
    amount,
  }: {
    nickname: string;
    amount: number;
  }): Promise<void> {
    await this.getAddressBookSelectPo().selectAddress(nickname);
    await this.enterAmount(amount);
    await this.clickContinue();
  }

  getSelectDestinationElement(): PageObjectElement {
    return this.root.byTestId("select-destination");
  }

  getDestinationSection(): PageObjectElement {
    return this.root.byTestId("destination-wrapper");
  }

  async hasDestinationSection(): Promise<boolean> {
    return this.getDestinationSection().isPresent();
  }

  async hasAddressBookDropdown(): Promise<boolean> {
    return this.root.byTestId("address-book-dropdown").isPresent();
  }

  getManualAddressInput(): PageObjectElement {
    return this.root.querySelector('input[name="accounts-address"]');
  }

  getManualAddressWarning(): PageObjectElement {
    return this.root.byTestId("manual-address-warning");
  }

  getManualAddressLink(): PageObjectElement {
    return this.root.byTestId("manual-address-warning-link");
  }

  async hasManualAddressWarning(): Promise<boolean> {
    return this.getManualAddressWarning().isPresent();
  }

  async hasManualAddressLink(): Promise<boolean> {
    return this.getManualAddressLink().isPresent();
  }
}
