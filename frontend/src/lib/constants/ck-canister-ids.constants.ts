import type { DefaultIcrcCanisters } from "$lib/stores/default-icrc-canisters.store";
import { Principal } from "@dfinity/principal";

// ckEURC
export const CKEURC_LEDGER_CANISTER_ID = "pe5t5-diaaa-aaaar-qahwa-cai";
export const CKEURC_INDEX_CANISTER_ID = "pd4vj-oqaaa-aaaar-qahwq-cai";

// ckUNI
export const CKUNI_LEDGER_CANISTER_ID = "ilzky-ayaaa-aaaar-qahha-cai";
export const CKUNI_INDEX_CANISTER_ID = "imymm-naaaa-aaaar-qahhq-cai";

// ckWBTC
export const CKWBTC_LEDGER_CANISTER_ID = "bptq2-faaaa-aaaar-qagxq-cai";
export const CKWBTC_INDEX_CANISTER_ID = "dso6s-wiaaa-aaaar-qagya-cai";

// ckLINK
export const CKLINK_LEDGER_CANISTER_ID = "g4tto-rqaaa-aaaar-qageq-cai";
export const CKLINK_INDEX_CANISTER_ID = "gvqys-hyaaa-aaaar-qagfa-cai";

// ckXAUT
export const CKXAUT_LEDGER_CANISTER_ID = "nza5v-qaaaa-aaaar-qahzq-cai";
export const CKXAUT_INDEX_CANISTER_ID = "nmhmy-riaaa-aaaar-qah2a-cai";

// ckPEPE
export const CKPEPE_LEDGER_CANISTER_ID = "etik7-oiaaa-aaaar-qagia-cai";
export const CKPEPE_INDEX_CANISTER_ID = "eujml-dqaaa-aaaar-qagiq-cai";

// ckWSTETH
export const CKWSTETH_LEDGER_CANISTER_ID = "j2tuh-yqaaa-aaaar-qahcq-cai";
export const CKWSTETH_INDEX_CANISTER_ID = "jtq73-oyaaa-aaaar-qahda-cai";

// ckSHIB
export const CKSHIB_LEDGER_CANISTER_ID = "fxffn-xiaaa-aaaar-qagoa-cai";
export const CKSHIB_INDEX_CANISTER_ID = "fqedz-2qaaa-aaaar-qagoq-cai";

// ckUSDT
export const CKUSDT_LEDGER_CANISTER_ID = "cngnf-vqaaa-aaaar-qag4q-cai";
export const CKUSDT_INDEX_CANISTER_ID = "cefgz-dyaaa-aaaar-qag5a-cai";

// ckOCT
export const CKOCT_LEDGER_CANISTER_ID = "ebo5g-cyaaa-aaaar-qagla-cai";
export const CKOCT_INDEX_CANISTER_ID = "egp3s-paaaa-aaaar-qaglq-cai";

export const allCkTokens: DefaultIcrcCanisters[] = [
  {
    ledgerCanisterId: Principal.fromText(CKEURC_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKEURC_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKUNI_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKUNI_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKWBTC_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKWBTC_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKLINK_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKLINK_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKXAUT_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKXAUT_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKPEPE_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKPEPE_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKWSTETH_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKWSTETH_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKSHIB_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKSHIB_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKUSDT_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKUSDT_INDEX_CANISTER_ID),
  },
  {
    ledgerCanisterId: Principal.fromText(CKOCT_LEDGER_CANISTER_ID),
    indexCanisterId: Principal.fromText(CKOCT_INDEX_CANISTER_ID),
  },
];
