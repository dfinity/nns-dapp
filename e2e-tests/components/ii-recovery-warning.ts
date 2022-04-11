// Warning page about missing recovery option.
export class IIRecoveryMissingWarningPage {
  static readonly SELECTOR: string = "#warningContainer";
  static readonly FIX_BUTTON_SELECTOR: string = "#displayWarningAddRecovery";
  static readonly SKIP_BUTTON_SELECTOR: string = "#displayWarningRemindLater";

  static skipAddingRecoveryMechanism = async (browser: WebdriverIO.Browser) => {
    const button = await browser.$(skipAddingRecoveryMechanismButton);
    await button.waitForExist();
    await button.click();
  };
}
