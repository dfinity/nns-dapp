// import { Actor, Cbor, HttpAgent } from "@dfinity/agent";
// import { validate } from "./utils";
// import * as base64Arraybuffer from 'base64-arraybuffer';
// import { Principal } from "@dfinity/principal";
// import { IDL } from "@dfinity/candid";
// import { idlFactory } from "./canisters/nnsUI/canister.did";
// //import { GetAccountResponse } from "./canisters/nnsUI/rawService";
// //import { sha256 } from "js-sha256";
// import builder from "./canisters/nnsUI/builder"
// import CANISTER_ID from "./canisters/nnsUI/canisterId";
// import { _SERVICE } from "./canisters/nnsUI/rawService";

// test('certified query test', async () => {
//     jest.setTimeout(1000 * 60);
//     const certificateBase64 = "2dn3omR0cmVlgwGDAYMBgwJIY2FuaXN0ZXKDAYMCSgAAAAAAAAAAAQGDAYMBgwJOY2VydGlmaWVkX2RhdGGCA1ggPI4GuZp/hiF7CqMs1zr6UpYE/2Vhu8xUscxNmqKCOk+CBFgg8febG6vhBwGzAFIDeoEe83vqUZL8LJFQDI70nWVa2GyCBFggUmiz0wZS4DnkJUykrfRWxubh6sNFfrdSe8VVlfutxyyCBFggA/vuVo5FLQA1ZxtS1or0Xj+C/LtvV1hm8oc1nK9nkA2CBFgg325r059Eg1+rr6J6yrewV0Aw6fSB/SNfhI3+sh7pwIaCBFggcTqzDS6sHODkZgGoMUmEjCwIoqhDhum73JhS4ckeWLeDAYIEWCAZ1OUfNtVqYUIdHLaVCzg4uHhPJXuQKZ/0HVY/LCsZU4MCRHRpbWWCA0nQhJmFtvnVyBZpc2lnbmF0dXJlWDC0xOn+/zcZIQd/A5b1trJbSOmGep3z1kWCDckPpKD65C9Pb8TB/azRYzmkE9b2zsI=";
//     const treeBase64 = "2dn3gwGDAkhhY2NvdW50c4MCWEBmMmNjNjQzYjhmNjRhNDYyOTc4NWMyNDBmNjBjYjFiYzVhMjc1OTExMDc0YWY1NGNhNjllNzEzZjRmZDlhOTIyggNYICiIgdhRpapXTNzdaRGLqfZEyasVo0ucynSSfn+EhwhhggRYIH8Flxep1sNZoGxYfuHMWGP0Cfi65zcvS5uXizzdz1Qw";

//     const certificate = base64Arraybuffer.decode(certificateBase64);
//     const tree = base64Arraybuffer.decode(treeBase64);
// //    console.log(window);
// //    console.log(window.fetch);
//     const agent = new HttpAgent({
//       host: "http://localhost:8080",
//     });

//     await agent.fetchRootKey();

//     const backendService = Actor.createActor(idlFactory, {
//       agent,
//       canisterId: CANISTER_ID,
//     }) as _SERVICE;

//     const body2 = IDL.encode([IDL.Variant({
//       'Ok' : IDL.Record({
//         'account_identifier' : IDL.Text,
//         'hardware_wallet_accounts' : IDL.Vec(IDL.Record({
//           'principal' : IDL.Principal,
//           'name' : IDL.Text,
//           'account_identifier' : IDL.Text,
//         })),
//         'sub_accounts' : IDL.Vec(IDL.Record({
//           'name' : IDL.Text,
//           'sub_account' : IDL.Vec(IDL.Nat8),
//           'account_identifier' : IDL.Text,
//         }))
//       }),
//     'AccountNotFound' : IDL.Null,
//     })], [
//       {
//         'Ok':  {
//           'account_identifier' : "f2cc643b8f64a4629785c240f60cb1bc5a275911074af54ca69e713f4fd9a922",
//           'hardware_wallet_accounts' : [],
//           'sub_accounts' : [],
//         }
//       }
//    ]);

//    console.log("candid encoded bytes adsf: ");
//    console.log(bufferToHex(body2));

//     /*
//     const x: GetAccountResponse = {
//       'Ok':  {
//         'account_identifier' : "f2cc643b8f64a4629785c240f60cb1bc5a275911074af54ca69e713f4fd9a922",
//         'hardware_wallet_accounts' : Array.of(),
//         'sub_accounts' : Array.of(),
//       }
//     };

//     const expectedSha = base64Arraybuffer.decode("KIiB2FGlqldM3N1pEYup9kTJqxWjS5zKdJJ+f4SHCGE=");
//     console.log("hash of candid")
//     let algorithm = { name: 'SHA-256' }
//     const sha = await crypto.subtle.digest(algorithm, body2);
//     console.log(sha);
//     console.log("expected sha");
//     console.log(expectedSha);

//     const body = Cbor.encode(x);
// //    const sha256_byes = crypto.subtle.digest('SHA-256', encoded);*/

//     const accountId = await backendService.add_account();
//     console.log(`accountID: ${accountId}`);
//     const resp = await backendService.get_account();
//     console.log(`get account response`);
//     console.log(resp);

//     /*
//     const service = idlFactory({ IDL });
//     for (const [methodName, func] of service._fields) {
//       console.log(`method name: ${methodName}`)
//       console.log(methodName);
//       if (methodName == 'get_account') {
//         const candidBytes = IDL.encode(func.retTypes, [resp.account]);
//         console.log("candid bytes 2222222:")
//         console.log(candidBytes);
//       }
// //      this[methodName] = _createActorMethod(this, methodName, func);
//     }*/

//     const body3 = IDL.encode([IDL.Variant({
//       'Ok' : IDL.Record({
//         'account_identifier' : IDL.Text,
//         'hardware_wallet_accounts' : IDL.Vec(IDL.Record({
//           'principal' : IDL.Principal,
//           'name' : IDL.Text,
//           'account_identifier' : IDL.Text,
//         })),
//         'sub_accounts' : IDL.Vec(IDL.Record({
//           'name' : IDL.Text,
//           'sub_account' : IDL.Vec(IDL.Nat8),
//           'account_identifier' : IDL.Text,
//         }))
//       }),
//     'AccountNotFound' : IDL.Null,
//     })], [resp.account]);

//     console.log("BODY 3 bytes");
//     console.log(bufferToHex(body3));

//     expect(await validate(Principal.fromText("rwlgt-iiaaa-aaaaa-aaaaa-cai"), body3, certificate, tree, agent, true)).toBe(true);
// });

// function bufferToHex (buffer: ArrayBuffer) {
//   return [...new Uint8Array (buffer)]
//       .map (b => b.toString (16).padStart (2, "0"))
//       .join ("");
// }

// test('certified query test', async () => {
//     });
