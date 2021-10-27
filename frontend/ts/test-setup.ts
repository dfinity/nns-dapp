import textEncoding = require("text-encoding");

global.crypto = require("@trust/webcrypto");
global.TextEncoder = textEncoding.TextEncoder;

const { Response, Request, Headers, fetch } = require("whatwg-fetch");
global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;
