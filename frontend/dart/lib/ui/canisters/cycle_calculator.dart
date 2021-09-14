import 'package:nns_dapp/data/cycles.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/data/icp_source.dart';

class CycleCalculator {
  late double e8ToCycleRatio;

  CycleCalculator(BigInt trillionRatio) {
    this.e8ToCycleRatio = trillionRatio / BigInt.from(E8S_PER_ICP);
  }

  Cycles icpToCycles(ICP icp) {
    return Cycles.fromBigInt(
        BigInt.from(icp.asE8s().toDouble() * this.e8ToCycleRatio));
  }

  ICP cyclesToIcp(Cycles cycles) {
    return ICP
        .fromE8s(BigInt.from(cycles.amount.toDouble() / this.e8ToCycleRatio));
  }
}
