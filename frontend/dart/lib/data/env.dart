const REDIRECT_TO_LEGACY = String.fromEnvironment('REDIRECT_TO_LEGACY');
bool SHOW_ACCOUNTS_ROUTE() { return ["flutter", "both", "prod", "staging"].contains(REDIRECT_TO_LEGACY); }
bool SHOW_NEURONS_ROUTE() { return ["flutter", "both", "prod", "staging"].contains(REDIRECT_TO_LEGACY); }
bool SHOW_PROPOSALS_ROUTE() { return ["flutter", "both", "prod"].contains(REDIRECT_TO_LEGACY); }
bool SHOW_CANISTERS_ROUTE() { return ["flutter", "both", "prod", "staging"].contains(REDIRECT_TO_LEGACY); }
