import { Actor, Agent, Principal } from "@dfinity/agent";
import { InterfaceFactory } from "@dfinity/agent/lib/cjs/idl";

export default function<T>(agent: Agent, canisterId: Principal, factory: InterfaceFactory) {
    return Actor.createActor(factory, {
        agent,
        canisterId
    }) as T;
}