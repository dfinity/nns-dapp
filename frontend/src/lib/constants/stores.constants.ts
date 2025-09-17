export enum StoreLocalStorageKey {
  ProposalFilters = "nnsProposalFilters",
  Theme = "nnsTheme",
  FeatureFlags = "nnsOverrideFeatureFlags",
  BitcoinConvertBlockIndexes = "nnsBitcoinConvertBlockIndexes",
  SnsProposalFilters = "nnsSnsProposalFilters",
  JsonRepresentation = "jsonRepresentation",
  HideZeroBalances = "nnsHideZeroBalanceTokens",
  HideZeroNeurons = "nnsHideZeroNeuronProjects",
  HighlightDisplay = "nnsHighlightDisplay-",
  BalancePrivacyOption = "nnsBalancePrivacyOption",
}

export const NOT_LOADED = Symbol("NOT_LOADED");
