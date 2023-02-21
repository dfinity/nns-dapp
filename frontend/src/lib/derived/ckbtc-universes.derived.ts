import type {Universe} from "$lib/types/universe";
import {CKBTC_UNIVERSE_CANISTER_ID, CKTESTBTC_UNIVERSE_CANISTER_ID} from "$lib/constants/ckbtc-canister-ids.constants";
import {derived, type Readable} from "svelte/store";
import {ENABLE_CKBTC_LEDGER, ENABLE_CKBTC_RECEIVE} from "$lib/stores/feature-flags.store";

const CKBTC_UNIVERSE: Universe = {
    canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
};

const CKTESTBTC_UNIVERSE: Universe = {
    canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
};

export const ckBTCUniversesStore = derived<
    [
        Readable<boolean>,
        Readable<boolean>
    ],
    Universe[]
>(
    [ENABLE_CKBTC_LEDGER, ENABLE_CKBTC_RECEIVE],
    ([$ENABLE_CKBTC_LEDGER, $ENABLE_CKBTC_RECEIVE]: [
          boolean,
        boolean
    ]) => [
        ...($ENABLE_CKBTC_LEDGER ? [CKBTC_UNIVERSE] : []),
        ...($ENABLE_CKBTC_RECEIVE ? [CKTESTBTC_UNIVERSE] : []),
    ]
);