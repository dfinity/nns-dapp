import { Principal } from "@dfinity/agent";
import { OWN_CANISTER_ID } from "../../config.json";

const CANISTER_ID = Principal.fromText(OWN_CANISTER_ID);

export default CANISTER_ID;
