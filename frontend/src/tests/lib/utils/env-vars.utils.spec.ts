import { getEnvVars } from "$lib/utils/env-vars.utils";
import { principal } from "$tests/mocks/sns-projects.mock";

// env-vars.utils.ts is mocked in vitest.setup.ts so we need to unmock it to be
// able to test it.
vi.unmock("$lib/utils/env-vars.utils");

describe("env-vars-utils", () => {
  beforeEach(() => {
    // Make sure no non-stubbed environment variables are present
    for (const envVar of Object.keys(import.meta.env)) {
      vi.stubEnv(envVar, "");
    }
    vi.stubEnv("VITE_DFX_NETWORK", "local");
    vi.stubEnv(
      "VITE_CYCLES_MINTING_CANISTER_ID",
      "rkp4c-7iaaa-aaaaa-aaaca-cai"
    );
    vi.stubEnv("VITE_WASM_CANISTER_ID", "qaa6y-5yaaa-aaaaa-aaafa-cai");
    vi.stubEnv("VITE_GOVERNANCE_CANISTER_ID", "rrkah-fqaaa-aaaaa-aaaaq-cai");
    vi.stubEnv("VITE_TVL_CANISTER_ID", "");
    vi.stubEnv("VITE_LEDGER_CANISTER_ID", "ryjl3-tyaaa-aaaaa-aaaba-cai");
    vi.stubEnv("VITE_OWN_CANISTER_ID", "qsgjb-riaaa-aaaaa-aaaga-cai");
    vi.stubEnv("VITE_FETCH_ROOT_KEY", "true");
    vi.stubEnv(
      "VITE_FEATURE_FLAGS",
      '{\\"ENABLE_CKTESTBTC\\":false,\\"ENABLE_SNS\\":true,\\"ENABLE_SNS_2\\":true,\\"ENABLE_VOTING_INDICATION\\":false}'
    );
    vi.stubEnv("VITE_HOST", "http://localhost:8080");
    vi.stubEnv(
      "VITE_IDENTITY_SERVICE_URL",
      "http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080"
    );
    vi.stubEnv(
      "VITE_AGGREGATOR_CANISTER_URL",
      "http://bd3sg-teaaa-aaaaa-qaaba-cai.localhost:8080"
    );
    vi.stubEnv("VITE_CKBTC_LEDGER_CANISTER_ID", "oz7p6-neaaa-aaaaa-qabfa-cai");
    vi.stubEnv("VITE_INDEX_CANISTER_ID", "mecbw-6maaa-aaaaa-qabkq-cai");
    vi.stubEnv("VITE_CKBTC_MINTER_CANISTER_ID", "o66jk-a4aaa-aaaaa-qabfq-cai");
    vi.stubEnv("VITE_CKBTC_INDEX_CANISTER_ID", "olzyh-buaaa-aaaaa-qabga-cai");
    vi.stubEnv("VITE_CKETH_LEDGER_CANISTER_ID", "omy6t-mmaaa-aaaaa-qabgq-cai");
    vi.stubEnv("VITE_CKETH_INDEX_CANISTER_ID", "of3vp-2eaaa-aaaaa-qabha-cai");
  });

  const defaultExpectedEnvVars = {
    ckbtcIndexCanisterId: "olzyh-buaaa-aaaaa-qabga-cai",
    ckbtcLedgerCanisterId: "oz7p6-neaaa-aaaaa-qabfa-cai",
    ckbtcMinterCanisterId: "o66jk-a4aaa-aaaaa-qabfq-cai",
    ckethIndexCanisterId: "of3vp-2eaaa-aaaaa-qabha-cai",
    ckethLedgerCanisterId: "omy6t-mmaaa-aaaaa-qabgq-cai",
    cyclesMintingCanisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
    dfxNetwork: "local",
    featureFlags:
      '{"ENABLE_CKTESTBTC":false,"ENABLE_SNS":true,"ENABLE_SNS_2":true,"ENABLE_VOTING_INDICATION":false}',
    fetchRootKey: "true",
    governanceCanisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    host: "http://localhost:8080",
    identityServiceUrl: "http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080",
    ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    indexCanisterId: "mecbw-6maaa-aaaaa-qabkq-cai",
    ownCanisterId: "qsgjb-riaaa-aaaaa-aaaga-cai",
    snsAggregatorUrl: "http://bd3sg-teaaa-aaaaa-qaaba-cai.localhost:8080",
    tvlCanisterId: undefined,
    wasmCanisterId: "qaa6y-5yaaa-aaaaa-aaafa-cai",
  };

  it("should return the correct environment variables", () => {
    expect(getEnvVars()).toEqual(defaultExpectedEnvVars);
  });

  it("should return the correct ledger canister ID", () => {
    const ledgerCanisterId = principal(543).toText();
    vi.stubEnv("VITE_LEDGER_CANISTER_ID", ledgerCanisterId);
    expect(getEnvVars()).toEqual({
      ...defaultExpectedEnvVars,
      ledgerCanisterId,
    });
  });

  it("ledger canister ID is mandatory", () => {
    vi.stubEnv("VITE_LEDGER_CANISTER_ID", "");

    expect(() => getEnvVars()).toThrowError(
      "Missing mandatory environment variables: ledgerCanisterId"
    );
  });

  it("should return the correct index canister ID", () => {
    const indexCanisterId = principal(543).toText();
    vi.stubEnv("VITE_INDEX_CANISTER_ID", indexCanisterId);
    expect(getEnvVars()).toEqual({
      ...defaultExpectedEnvVars,
      indexCanisterId,
    });
  });

  it("index canister ID is mandatory", () => {
    vi.stubEnv("VITE_INDEX_CANISTER_ID", "");
    expect(() => getEnvVars()).toThrowError(
      "Missing mandatory environment variables: indexCanisterId"
    );
  });

  it("should return the correct TVL canister ID", () => {
    const tvlCanisterId = principal(643).toText();
    vi.stubEnv("VITE_TVL_CANISTER_ID", tvlCanisterId);
    expect(getEnvVars()).toEqual({
      ...defaultExpectedEnvVars,
      tvlCanisterId,
    });
  });

  it("TVL canister ID is not mandatory", () => {
    vi.stubEnv("VITE_TVL_CANISTER_ID", "");
    expect(getEnvVars()).toEqual({
      ...defaultExpectedEnvVars,
      tvlCanisterId: undefined,
    });
  });
});
