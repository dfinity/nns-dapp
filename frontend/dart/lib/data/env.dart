const REDIRECT_TO_LEGACY = String.fromEnvironment('REDIRECT_TO_LEGACY');
bool showAccountsRoute() { return ["flutter", "both", "prod", "staging"].contains(REDIRECT_TO_LEGACY); }
bool showNeuronsRoute() { return ["flutter", "both", "prod"].contains(REDIRECT_TO_LEGACY); }
bool showProposalsRoute() { return ["flutter", "both"].contains(REDIRECT_TO_LEGACY); }
bool showCanistersRoute() { return ["flutter", "both", "prod", "staging"].contains(REDIRECT_TO_LEGACY); }
