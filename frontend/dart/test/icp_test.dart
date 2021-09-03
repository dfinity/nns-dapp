import 'package:dfinity_wallet/data/icp.dart';
import 'package:test/test.dart';

void main() {
  group("ICP.fromString", () {
    test('Whole numbers', () {
      expect(ICP.fromString("1").asE8s(), BigInt.from(100000000));
      expect(ICP.fromString("20").asE8s(), BigInt.from(2000000000));
      expect(ICP.fromString("0000000999").asE8s(), BigInt.from(99900000000));
    });

    test('Fractions', () {
      expect(ICP.fromString("0.1").asE8s(), BigInt.from(10000000));
      expect(ICP.fromString("1.45").asE8s(), BigInt.from(145000000));
      expect(ICP.fromString("0.00000001").asE8s(), BigInt.from(1));
      expect(ICP.fromString("0.12345678").asE8s(), BigInt.from(12345678));
      expect(ICP.fromString("1.00000008").asE8s(), BigInt.from(100000008));
      expect(ICP.fromString("1.23456789").asE8s(), BigInt.from(123456789));
      expect(ICP.fromString("99.00000008").asE8s(), BigInt.from(9900000008));
      expect(ICP.fromString(".0").asE8s(), BigInt.from(0));
      expect(ICP.fromString(".01").asE8s(), BigInt.from(1000000));
    });

    test('Less than 1e8 throws an error', () {
      expect(() => ICP.fromString("0.000000001"), throwsFormatException);
    });

    test('Bad input: empty string', () {
      expect(() => ICP.fromString(""), throwsFormatException);
    });

    test('Bad input: garbage', () {
      expect(() => ICP.fromString("@12asdf"), throwsFormatException);
    });

    test('Bad input: non-numerics', () {
      expect(() => ICP.fromString("12a"), throwsFormatException);
    });

    test('Bad input: multiple decimals', () {
      expect(() => ICP.fromString("123.123.123"), throwsFormatException);
    });

    test('Bad input: negative numbers', () {
      expect(() => ICP.fromString("-1"), throwsFormatException);
      expect(() => ICP.fromString("-1.32"), throwsFormatException);
    });
  });

  test("ICP.asString", () {
    expect(
        ICP
            .fromString("1.23")
            .asString(withSeparators: true, minDecimals: 1, maxDecimals: 2),
        "1.23");
    expect(
        ICP
            .fromString("0.000001")
            .asString(withSeparators: true, minDecimals: 1, maxDecimals: 6),
        "0.000001");
    expect(
        ICP
            .fromString("1000000.000001")
            .asString(withSeparators: true, minDecimals: 1, maxDecimals: 6),
        "1'000'000.000001");
  });
}
