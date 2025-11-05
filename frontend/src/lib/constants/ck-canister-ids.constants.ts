import type { DefaultIcrcCanisters } from "$lib/stores/default-icrc-canisters.store";
import { Principal } from "@icp-sdk/core/principal";

// ckEURC
const CKEURC_LEDGER_CANISTER_ID_TEXT = "pe5t5-diaaa-aaaar-qahwa-cai";
const CKEURC_INDEX_CANISTER_ID_TEXT = "pd4vj-oqaaa-aaaar-qahwq-cai";

// ckUNI
const CKUNI_LEDGER_CANISTER_ID_TEXT = "ilzky-ayaaa-aaaar-qahha-cai";
const CKUNI_INDEX_CANISTER_ID_TEXT = "imymm-naaaa-aaaar-qahhq-cai";

// ckWBTC
const CKWBTC_LEDGER_CANISTER_ID_TEXT = "bptq2-faaaa-aaaar-qagxq-cai";
const CKWBTC_INDEX_CANISTER_ID_TEXT = "dso6s-wiaaa-aaaar-qagya-cai";

// ckLINK
const CKLINK_LEDGER_CANISTER_ID_TEXT = "g4tto-rqaaa-aaaar-qageq-cai";
const CKLINK_INDEX_CANISTER_ID_TEXT = "gvqys-hyaaa-aaaar-qagfa-cai";

// ckXAUT
const CKXAUT_LEDGER_CANISTER_ID_TEXT = "nza5v-qaaaa-aaaar-qahzq-cai";
const CKXAUT_INDEX_CANISTER_ID_TEXT = "nmhmy-riaaa-aaaar-qah2a-cai";

// ckPEPE
export const CKPEPE_LEDGER_CANISTER_ID_TEXT = "etik7-oiaaa-aaaar-qagia-cai";
const CKPEPE_INDEX_CANISTER_ID_TEXT = "eujml-dqaaa-aaaar-qagiq-cai";

// ckWSTETH
const CKWSTETH_LEDGER_CANISTER_ID_TEXT = "j2tuh-yqaaa-aaaar-qahcq-cai";
const CKWSTETH_INDEX_CANISTER_ID_TEXT = "jtq73-oyaaa-aaaar-qahda-cai";

// ckSHIB
const CKSHIB_LEDGER_CANISTER_ID_TEXT = "fxffn-xiaaa-aaaar-qagoa-cai";
const CKSHIB_INDEX_CANISTER_ID_TEXT = "fqedz-2qaaa-aaaar-qagoq-cai";

// ckUSDT
export const CKUSDT_LEDGER_CANISTER_ID_TEXT = "cngnf-vqaaa-aaaar-qag4q-cai";
const CKUSDT_INDEX_CANISTER_ID_TEXT = "cefgz-dyaaa-aaaar-qag5a-cai";

// ckOCT
export const CKOCT_LEDGER_CANISTER_ID_TEXT = "ebo5g-cyaaa-aaaar-qagla-cai";
const CKOCT_INDEX_CANISTER_ID_TEXT = "egp3s-paaaa-aaaar-qaglq-cai";

export const allCkTokens: DefaultIcrcCanisters[] = [
  {
    ledgerCanisterId: Principal.fromText(CKEURC_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKEURC_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKUNI_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKUNI_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKWBTC_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKWBTC_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKLINK_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKLINK_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKXAUT_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKXAUT_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKPEPE_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKPEPE_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKWSTETH_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKWSTETH_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKSHIB_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKSHIB_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKUSDT_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKUSDT_INDEX_CANISTER_ID_TEXT),
  },
  {
    ledgerCanisterId: Principal.fromText(CKOCT_LEDGER_CANISTER_ID_TEXT),
    indexCanisterId: Principal.fromText(CKOCT_INDEX_CANISTER_ID_TEXT),
  },
];
