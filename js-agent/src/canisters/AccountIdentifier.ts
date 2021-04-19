export default class AccountIdentifier {
    private readonly _bytes: Uint8Array;

    public constructor(bytes: Uint8Array) {
        this._bytes = bytes;
    }

    public static fromString(hexString: string): AccountIdentifier {
        return new AccountIdentifier(Uint8Array.from(Buffer.from(hexString, "hex")));
    }

    public get bytes(): Uint8Array {
        return this._bytes;
    }
}