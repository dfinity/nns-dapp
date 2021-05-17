import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';

import '../../../dfinity.dart';

class TransactionDetailsWidget extends StatelessWidget {
  final double amount;
  final ICPSource source;
  final String destination;

  const TransactionDetailsWidget(
      {Key? key,
      required this.amount,
      required this.source,
      required this.destination})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                amountLabelSuffix: " ICP"
              ),
            ),
            TallFormDivider(),
            Text("Source", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            ResponsiveCopyId(accountIdentifier: source.address),
            TallFormDivider(),
            Text("Destination", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            ResponsiveCopyId(accountIdentifier: destination),
            TallFormDivider(),
            Text("Transaction Fee (billed to source)", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(TRANSACTION_FEE_ICP.toString() + " ICP",
                style: context.textTheme.bodyText1),
            VerySmallFormDivider()
          ],
        ),
      ),
    ));
  }
}
