var agent = require("@dfinity/agent");
require("borc");
require("tweetnacl");
var webauthn = require("./webauthn.js");

module.exports = {
    'agent': agent,
    'webauthn': webauthn
};

class AuthenticationProxy {
     createAuthenticationIdentity() {
         return webauthn.WebAuthnIdentity.create()
     }
}

window.WebAuthnIdentity = webauthn.WebAuthnIdentity;
window.AuthenticationProxy = AuthenticationProxy;
window.webauthn = webauthn;


