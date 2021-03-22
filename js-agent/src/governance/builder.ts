import { Identity, Principal } from "@dfinity/agent";
import _SERVICE from "./service";
import IDL from "./canister.did.js";
import buildActor from "../buildActor";

const CANISTER_ID = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

export default function(host: string, identity: Identity) : _SERVICE {
    return buildActor<_SERVICE>(host, identity, CANISTER_ID, IDL);
}
