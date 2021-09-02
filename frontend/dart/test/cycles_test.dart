import 'package:dfinity_wallet/data/cycles.dart';
import 'package:test/test.dart';

void main() {
  test("Cycles.asStringT", () {
    expect(Cycles.fromBigInt(BigInt.from(1000000000000)).asStringT(true, 1, 2),
        "1.00");
    expect(Cycles.fromBigInt(BigInt.from(10000000)).asStringT(true, 1, 5),
        "0.00001");
    expect(Cycles.fromBigInt(BigInt.from(12345678900000)).asStringT(true, 0, 3),
        "12.345");
    expect(
        Cycles.fromBigInt(BigInt.from(1234567891234567890))
            .asStringT(true, 0, 0),
        "1,234,567");
  });
}
