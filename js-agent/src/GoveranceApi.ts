import { Identity } from "@dfinity/agent";

export default class GovernanceApi {

    private _host: string;
    private _identity: Identity;

    constructor(host: string, identity: Identity) {
        this._host = host;
        this._identity = identity;
    }   

    public async command() {
        
    }
}
