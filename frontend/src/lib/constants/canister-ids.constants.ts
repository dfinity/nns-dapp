import { Principal } from '@dfinity/principal';

export const OWN_CANISTER_ID = Principal.fromText(import.meta.env.VITE_OWN_CANISTER_ID as string);
export const LEDGER_CANISTER_ID = Principal.fromText(
	import.meta.env.VITE_LEDGER_CANISTER_ID as string
);
export const GOVERNANCE_CANISTER_ID = Principal.fromText(
	import.meta.env.VITE_GOVERNANCE_CANISTER_ID as string
);
export const CYCLES_MINTING_CANISTER_ID = Principal.fromText(
	import.meta.env.VITE_CYCLES_MINTING_CANISTER_ID as string
);
