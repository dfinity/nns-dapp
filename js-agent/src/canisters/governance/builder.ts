import { Identity } from "@dfinity/agent";
import ServiceInterface from "./service";
import IDL from "./canister.did.js";
import buildActor from "../buildActor";
import CANISTER_ID from "./canisterId";

export default function(host: string, identity: Identity) : ServiceInterface {
    return buildActor<ServiceInterface>(host, identity, CANISTER_ID, IDL);
}
