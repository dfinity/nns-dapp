// Warning page about missing recovery option.
export class IIRecoveryMissingWarningPage {
  static readonly SELECTOR: string = "#warningContainer";
  static readonly FIX_BUTTON_SELECTOR: string = `${IIRecoveryMissingWarningPage.SELECTOR} #displayWarningAddRecovery`;
  static readonly SKIP_BUTTON_SELECTOR: string = `${IIRecoveryMissingWarningPage.SELECTOR} #displayWarningRemindLater`;
}
