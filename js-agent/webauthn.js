"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuthnIdentity = exports.CosePublicKey = void 0;
const agent_1 = require("@dfinity/agent");
const borc_1 = __importDefault(require("borc"));
const tweetnacl = __importStar(require("tweetnacl"));
function _coseToDerEncodedBlob(cose) {
    const c = new Uint8Array(cose);
    if (c.byteLength > 230) {
        // 'Tis true, 'tis too much.
        throw new Error('Cannot encode byte length of more than 230.');
    }
    // prettier-ignore
    // @ts-ignore
    // @ts-ignore
    const der = new Uint8Array([
        0x30, 0x10 + c.byteLength + 1,
        0x30, 0x0C,
        // OID 1.3.6.1.4.1.56387.1.1
        0x06, 0x0A, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x83, 0xB8, 0x43, 0x01, 0x01,
        0x03, 1 + c.byteLength, 0x00,
        // @ts-ignore
        ...c,
    ]);
    return agent_1.derBlobFromBlob(agent_1.blobFromUint8Array(der));
}
/**
 * From the documentation;
 * The authData is a byte array described in the spec. Parsing it will involve slicing bytes from
 * the array and converting them into usable objects.
 *
 * See https://webauthn.guide/#registration (subsection "Example: Parsing the authenticator data").
 *
 * @param authData The authData field of the attestation response.
 * @returns The COSE key of the authData.
 */
function _authDataToCose(authData) {
    const dataView = new DataView(new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    // @ts-ignore
    [...new Uint8Array(idLenBytes)].forEach((v, i) => dataView.setUint8(i, v));
    const credentialIdLength = dataView.getUint16(0);
    // Get the public key object.
    return authData.slice(55 + credentialIdLength);
}
class CosePublicKey {
    constructor(_cose) {
        this._cose = _cose;
        this._encodedKey = _coseToDerEncodedBlob(_cose);
    }
    toDer() {
        return this._encodedKey;
    }
    getCose() {
        return this._cose;
    }
}
exports.CosePublicKey = CosePublicKey;
/**
 * Create a challenge from a string or array. The default challenge is always the same
 * because we don't need to verify the authenticity of the key on the server (we don't
 * register our keys with the IC). Any challenge would do, even one per key, randomly
 * generated.
 *
 * @param challenge The challenge to transform into a byte array. By default a hard
 *        coded string.
 */
function _createChallengeBuffer(challenge = '<ic0.app>') {
    if (typeof challenge === 'string') {
        return Uint8Array.from(challenge, c => c.charCodeAt(0));
    }
    else {
        return challenge;
    }
}
/**
 * Create a credentials to authenticate with a server. This is necessary in order in
 * WebAuthn to get credentials IDs (which give us the public key and allow us to
 * sign), but in the case of the Internet Computer, we don't actually need to register
 * it, so we don't.
 */
function _createCredential() {
    return __awaiter(this, void 0, void 0, function* () {
        const creds = (yield navigator.credentials.create({
            publicKey: {
                authenticatorSelection: {
                    userVerification: 'preferred',
                },
                attestation: 'direct',
                challenge: _createChallengeBuffer(),
                pubKeyCredParams: [{ type: 'public-key', alg: PubKeyCoseAlgo.ECDSA_WITH_SHA256 }],
                rp: {
                    name: 'ic0.app',
                },
                user: {
                    id: tweetnacl.randomBytes(16),
                    name: 'ic0 user',
                    displayName: 'ic0 user',
                },
            },
        }));
        // Validate that it's the correct type at runtime, since WebAuthn does not HAVE to
        // reply with a PublicKeyCredential.
        if (creds.response === undefined || !(creds.rawId instanceof ArrayBuffer)) {
            return null;
        }
        else {
            return creds;
        }
    });
}
// See https://www.iana.org/assignments/cose/cose.xhtml#algorithms for a complete
// list of these algorithms. We only list the ones we support here.
var PubKeyCoseAlgo;
(function (PubKeyCoseAlgo) {
    PubKeyCoseAlgo[PubKeyCoseAlgo["ECDSA_WITH_SHA256"] = -7] = "ECDSA_WITH_SHA256";
})(PubKeyCoseAlgo || (PubKeyCoseAlgo = {}));
/**
 * A SignIdentity that uses `navigator.credentials`. See https://webauthn.guide/ for
 * more information about WebAuthentication.
 */
class WebAuthnIdentity extends agent_1.SignIdentity {
    constructor(_rawId, cose) {
        super();
        this._rawId = _rawId;
        this._publicKey = new CosePublicKey(cose);
    }
    /**
     * Create an identity from a JSON serialization.
     * @param json - json to parse
     */
    static fromJSON(json) {
        const { publicKey, rawId } = JSON.parse(json);
        if (typeof publicKey !== 'string' || typeof rawId !== 'string') {
            throw new Error('Invalid JSON string.');
        }
        return new this(agent_1.blobFromHex(rawId), agent_1.blobFromHex(publicKey));
    }
    /**
     * Create an identity.
     */
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            const creds = yield _createCredential();
            if (!creds || creds.type !== 'public-key') {
                throw new Error('Could not create credentials.');
            }
            const response = creds.response;
            if (!(response.attestationObject instanceof ArrayBuffer)) {
                throw new Error('Was expecting an attestation response.');
            }
            // Parse the attestationObject as CBOR.
            const attObject = borc_1.default.decodeFirst(new Uint8Array(response.attestationObject));
            return new this(agent_1.blobFromUint8Array(new Uint8Array(creds.rawId)), agent_1.blobFromUint8Array(new Uint8Array(_authDataToCose(attObject.authData))));
        });
    }
    getPublicKey() {
        return this._publicKey;
    }
    sign(blob) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (yield navigator.credentials.get({
                publicKey: {
                    allowCredentials: [
                        {
                            type: 'public-key',
                            id: this._rawId,
                        },
                    ],
                    challenge: blob,
                    userVerification: 'preferred',
                },
            }));
            const response = result.response;
            if (response.signature instanceof ArrayBuffer &&
                response.authenticatorData instanceof ArrayBuffer) {
                const cbor = borc_1.default.encode(new borc_1.default.Tagged(55799, {
                    authenticator_data: new Uint8Array(response.authenticatorData),
                    client_data_json: new TextDecoder().decode(response.clientDataJSON),
                    signature: new Uint8Array(response.signature),
                }));
                if (!cbor) {
                    throw new Error('failed to encode cbor');
                }
                return agent_1.blobFromUint8Array(new Uint8Array(cbor));
            }
            else {
                throw new Error('Invalid response from WebAuthn.');
            }
        });
    }
    /**
     * Allow for JSON serialization of all information needed to reuse this identity.
     */
    toJSON() {
        return {
            publicKey: this._publicKey.getCose().toString('hex'),
            rawId: this._rawId.toString('hex'),
        };
    }
}
exports.WebAuthnIdentity = WebAuthnIdentity;
