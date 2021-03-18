"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuthnIdentity = exports.CosePublicKey = void 0;
var agent_1 = require("@dfinity/agent");
var borc_1 = require("borc");
var tweetnacl = require("tweetnacl");
function _coseToDerEncodedBlob(cose) {
    var c = new Uint8Array(cose);
    if (c.byteLength > 230) {
        // 'Tis true, 'tis too much.
        throw new Error('Cannot encode byte length of more than 230.');
    }
    // prettier-ignore
    // @ts-ignore
    // @ts-ignore
    var der = new Uint8Array(__spreadArrays([
        0x30, 0x10 + c.byteLength + 1,
        0x30, 0x0C,
        // OID 1.3.6.1.4.1.56387.1.1
        0x06, 0x0A, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x83, 0xB8, 0x43, 0x01, 0x01,
        0x03, 1 + c.byteLength, 0x00
    ], c));
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
    var dataView = new DataView(new ArrayBuffer(2));
    var idLenBytes = authData.slice(53, 55);
    // @ts-ignore
    __spreadArrays(new Uint8Array(idLenBytes)).forEach(function (v, i) { return dataView.setUint8(i, v); });
    var credentialIdLength = dataView.getUint16(0);
    // Get the public key object.
    return authData.slice(55 + credentialIdLength);
}
var CosePublicKey = /** @class */ (function () {
    function CosePublicKey(_cose) {
        this._cose = _cose;
        this._encodedKey = _coseToDerEncodedBlob(_cose);
    }
    CosePublicKey.prototype.toDer = function () {
        return this._encodedKey;
    };
    CosePublicKey.prototype.getCose = function () {
        return this._cose;
    };
    return CosePublicKey;
}());
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
function _createChallengeBuffer(challenge) {
    if (challenge === void 0) { challenge = '<ic0.app>'; }
    if (typeof challenge === 'string') {
        return Uint8Array.from(challenge, function (c) { return c.charCodeAt(0); });
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
    return __awaiter(this, void 0, void 0, function () {
        var creds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.credentials.create({
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
                    })];
                case 1:
                    creds = (_a.sent());
                    // Validate that it's the correct type at runtime, since WebAuthn does not HAVE to
                    // reply with a PublicKeyCredential.
                    if (creds.response === undefined || !(creds.rawId instanceof ArrayBuffer)) {
                        return [2 /*return*/, null];
                    }
                    else {
                        return [2 /*return*/, creds];
                    }
                    return [2 /*return*/];
            }
        });
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
var WebAuthnIdentity = /** @class */ (function (_super) {
    __extends(WebAuthnIdentity, _super);
    function WebAuthnIdentity(_rawId, cose) {
        var _this = _super.call(this) || this;
        _this._rawId = _rawId;
        _this._publicKey = new CosePublicKey(cose);
        return _this;
    }
    /**
     * Create an identity from a JSON serialization.
     * @param json - json to parse
     */
    WebAuthnIdentity.fromJSON = function (json) {
        var _a = JSON.parse(json), publicKey = _a.publicKey, rawId = _a.rawId;
        if (typeof publicKey !== 'string' || typeof rawId !== 'string') {
            throw new Error('Invalid JSON string.');
        }
        return new this(agent_1.blobFromHex(rawId), agent_1.blobFromHex(publicKey));
    };
    /**
     * Create an identity.
     */
    WebAuthnIdentity.create = function () {
        return __awaiter(this, void 0, void 0, function () {
            var creds, response, attObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _createCredential()];
                    case 1:
                        creds = _a.sent();
                        if (!creds || creds.type !== 'public-key') {
                            throw new Error('Could not create credentials.');
                        }
                        response = creds.response;
                        if (!(response.attestationObject instanceof ArrayBuffer)) {
                            throw new Error('Was expecting an attestation response.');
                        }
                        attObject = borc_1.default.decodeFirst(new Uint8Array(response.attestationObject));
                        return [2 /*return*/, new this(agent_1.blobFromUint8Array(new Uint8Array(creds.rawId)), agent_1.blobFromUint8Array(new Uint8Array(_authDataToCose(attObject.authData))))];
                }
            });
        });
    };
    WebAuthnIdentity.prototype.getPublicKey = function () {
        return this._publicKey;
    };
    WebAuthnIdentity.prototype.sign = function (blob) {
        return __awaiter(this, void 0, void 0, function () {
            var result, response, cbor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.credentials.get({
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
                        })];
                    case 1:
                        result = (_a.sent());
                        response = result.response;
                        if (response.signature instanceof ArrayBuffer &&
                            response.authenticatorData instanceof ArrayBuffer) {
                            cbor = borc_1.default.encode(new borc_1.default.Tagged(55799, {
                                authenticator_data: new Uint8Array(response.authenticatorData),
                                client_data_json: new TextDecoder().decode(response.clientDataJSON),
                                signature: new Uint8Array(response.signature),
                            }));
                            if (!cbor) {
                                throw new Error('failed to encode cbor');
                            }
                            return [2 /*return*/, agent_1.blobFromUint8Array(new Uint8Array(cbor))];
                        }
                        else {
                            throw new Error('Invalid response from WebAuthn.');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Allow for JSON serialization of all information needed to reuse this identity.
     */
    WebAuthnIdentity.prototype.toJSON = function () {
        return {
            publicKey: this._publicKey.getCose().toString('hex'),
            rawId: this._rawId.toString('hex'),
        };
    };
    return WebAuthnIdentity;
}(agent_1.SignIdentity));
exports.WebAuthnIdentity = WebAuthnIdentity;
