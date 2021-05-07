class CycleCalculator {
  final BigInt trillionRatio;
  double get ratio => trillionRatio / (BigInt.from(1000000) * BigInt.from(1000000));

  CycleCalculator(this.trillionRatio);

  double icpToTrillionCycles(double icp) {
    return icp * ratio.toInt();
  }

  double cyclesToIcp(double cycles) {
    return cycles.toInt() / ratio;
  }
}
