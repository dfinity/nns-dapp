import { isAddressBookCertified } from "$lib/utils/address-book.utils";
import { mockedConstants } from "$tests/utils/mockable-constants.test-utils";

describe("address-book.utils", () => {
  describe("isAddressBookCertified", () => {
    it("should accept a certified response", () => {
      expect(isAddressBookCertified(true)).toBe(true);
    });

    it("should reject a query response", () => {
      expect(isAddressBookCertified(false)).toBe(false);
    });

    it("should reject an address book that was never loaded", () => {
      expect(isAddressBookCertified(undefined)).toBe(false);
    });

    it("should accept a query response when the session forces the query strategy", () => {
      mockedConstants.FORCE_CALL_STRATEGY = "query";

      expect(isAddressBookCertified(false)).toBe(true);
    });

    it("should reject an address book that was never loaded when the session forces the query strategy", () => {
      mockedConstants.FORCE_CALL_STRATEGY = "query";

      expect(isAddressBookCertified(undefined)).toBe(false);
    });
  });
});
