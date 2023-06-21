import { jsonReplacer, jsonReviver } from "$lib/utils/json.utils";
import { AnonymousIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";

describe("json-utils", () => {
  describe("stringify", () => {
    it("should stringify bigint with a custom representation", () => {
      expect(JSON.stringify(123n, jsonReplacer)).toEqual(
        '{"__bigint__":"123"}'
      );
      expect(JSON.stringify({ value: 123n }, jsonReplacer)).toEqual(
        '{"value":{"__bigint__":"123"}}'
      );
    });

    it("should stringify Principal with a custom representation", () => {
      const principal = new AnonymousIdentity().getPrincipal();

      expect(JSON.stringify(principal, jsonReplacer)).toEqual(
        '{"__principal__":"2vxsx-fae"}'
      );
      expect(JSON.stringify({ principal }, jsonReplacer)).toEqual(
        '{"principal":{"__principal__":"2vxsx-fae"}}'
      );

      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");

      expect(JSON.stringify(rootCanisterId, jsonReplacer)).toEqual(
        '{"__principal__":"tmxop-wyaaa-aaaaa-aaapa-cai"}'
      );
      expect(
        JSON.stringify({ principal: rootCanisterId }, jsonReplacer)
      ).toEqual(
        '{"principal":{"__principal__":"tmxop-wyaaa-aaaaa-aaapa-cai"}}'
      );
    });

    it("should stringify Uint8Array with a custom representation", () => {
      const arr = arrayOfNumberToUint8Array([1, 2, 3]);

      expect(JSON.stringify(arr, jsonReplacer)).toEqual(
        '{"__uint8array__":[1,2,3]}'
      );
      expect(JSON.stringify({ arr }, jsonReplacer)).toEqual(
        '{"arr":{"__uint8array__":[1,2,3]}}'
      );
    });
  });

  describe("parse", () => {
    it("should parse bigint from a custom representation", () => {
      expect(JSON.parse('{"__bigint__":"123"}', jsonReviver)).toEqual(123n);
      expect(JSON.parse('{"value":{"__bigint__":"123"}}', jsonReviver)).toEqual(
        { value: 123n }
      );
    });

    it("should parse principal from a custom representation", () => {
      const principal = new AnonymousIdentity().getPrincipal();

      expect(JSON.parse('{"__principal__":"2vxsx-fae"}', jsonReviver)).toEqual(
        principal
      );
      expect(
        JSON.parse('{"principal":{"__principal__":"2vxsx-fae"}}', jsonReviver)
      ).toEqual({ principal });

      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");

      expect(
        JSON.parse(
          '{"__principal__":"tmxop-wyaaa-aaaaa-aaapa-cai"}',
          jsonReviver
        )
      ).toEqual(rootCanisterId);
      expect(
        JSON.parse(
          '{"principal":{"__principal__":"tmxop-wyaaa-aaaaa-aaapa-cai"}}',
          jsonReviver
        )
      ).toEqual({ principal: rootCanisterId });
    });

    it("should parse principal to object", () => {
      const obj = JSON.parse(
        '{"__principal__":"tmxop-wyaaa-aaaaa-aaapa-cai"}',
        jsonReviver
      );
      expect(obj instanceof Principal).toBeTruthy();
      expect((obj as Principal).toText()).toEqual(
        "tmxop-wyaaa-aaaaa-aaapa-cai"
      );
    });

    it("should parse Uint8Array from a custom representation", () => {
      const arr = arrayOfNumberToUint8Array([1, 2, 3]);

      expect(JSON.parse('{"__uint8array__":[1,2,3]}', jsonReviver)).toEqual(
        arr
      );
      expect(
        JSON.parse('{"arr":{"__uint8array__":[1,2,3]}}', jsonReviver)
      ).toEqual({ arr });
    });
  });
});
