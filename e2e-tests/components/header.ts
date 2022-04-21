export class Header {
    static readonly SELECTOR: string = "header";
    static readonly LOGOUT_BUTTON_SELECTOR: string = `${Header.SELECTOR} [data-tid="logout"]`;
    static readonly TAB_TO_ACCOUNTS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-accounts"]`;
    static readonly TAB_TO_NEURONS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-neurons"]`;
    static readonly TAB_TO_PROPOSALS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-proposals"]`;
    static readonly TAB_TO_CANISTERS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-canisters"]`;
}
