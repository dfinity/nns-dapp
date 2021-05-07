import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../../dfinity.dart';

class TransactionDetailsWidget extends StatelessWidget {
  final double amount;
  final ICPSource origin;
  final String destination;

  const TransactionDetailsWidget(
      {Key? key,
      required this.amount,
      required this.origin,
      required this.destination})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    var transactionFeeICPMsg = TRANSACTION_FEE_ICP.toString() + " ICP";
    return Container(
        child: Center(
      child: IntrinsicWidth(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TallFormDivider(),
            Center(
              child: BalanceDisplayWidget(
                amount: amount,
                amountSize: 50,
                icpLabelSize: 0,
              ),
            ),
            TallFormDivider(),
            Text("Origin", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(origin.address, style: context.textTheme.bodyText1),
            TallFormDivider(),
            Text("Destination", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(destination, style: context.textTheme.bodyText1),
            TallFormDivider(),
            Text("Transaction Fee", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(transactionFeeICPMsg, style: context.textTheme.bodyText1),
            VerySmallFormDivider()
          ],
        ),
      ),
    ));
  }
}
