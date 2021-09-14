import 'package:nns_dapp/data/cycles.dart';
import 'package:test/test.dart';

void main() {
  test("Cycles.asStringT", () {
    expect(Cycles.fromBigInt(BigInt.from(1000000000000)).asStringT(), "1.00");
    expect(Cycles.fromBigInt(BigInt.from(10000000)).asStringT(), "0.00001");
    expect(
        Cycles.fromBigInt(BigInt.from(12345678900000))
            .asStringT(minDecimals: 0, maxDecimals: 3),
        "12.345");
    expect(
        Cycles.fromBigInt(BigInt.from(1234567891234567890))
            .asStringT(minDecimals: 0, maxDecimals: 0),
        "1'234'567");
  });
}
