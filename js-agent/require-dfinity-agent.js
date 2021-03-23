var agent = require("@dfinity/agent");
require("./src/governance/builder");
require("./src/ledger/builder");
//require("./src/ledgerView/builder");
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


