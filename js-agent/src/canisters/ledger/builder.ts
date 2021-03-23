import { Identity, Principal } from "@dfinity/agent";
import ServiceInterface from "./service";
import IDL from "./canister.did.js";
import buildActor from "../buildActor";

const CANISTER_ID = Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai");

export default function(host: string, identity: Identity) : ServiceInterface {
    return buildActor<ServiceInterface>(host, identity, CANISTER_ID, IDL);
}
