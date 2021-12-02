import textEncoding = require("text-encoding");
const { Response, Request, Headers, fetch } = require("whatwg-fetch");

global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;
global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;
