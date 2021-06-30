import { Actor, Agent } from "@dfinity/agent";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
import { Principal } from "@dfinity/principal";

export default function<T>(agent: Agent, canisterId: Principal, factory: InterfaceFactory) {
    return Actor.createActor(factory, {
        agent,
        canisterId
    }) as T;
}