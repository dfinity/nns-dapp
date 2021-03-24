import { Actor, HttpAgent, Identity, Principal } from "@dfinity/agent";
import { InterfaceFactory } from "@dfinity/agent/lib/cjs/idl";

export default function<T>(host: string, identity: Identity, canisterId: Principal, factory: InterfaceFactory) {
    const agent = new HttpAgent({
        host: host,
        identity: identity
    });

    return Actor.createActor(factory, {
        agent,
        canisterId
    }) as T;
}