import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../../dfinity.dart';

class TransactionDetailsWidget extends StatelessWidget {
  final ICP amount;
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
    final myLocale = Localizations.localeOf(context);
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
                amountLabelSuffix: " ICP",
                locale: myLocale.languageCode,
              ),
            ),
            TallFormDivider(),
            Text("Source", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(source.address, style: context.textTheme.bodyText1),
            TallFormDivider(),
            Text("Destination", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(destination, style: context.textTheme.bodyText1),
            TallFormDivider(),
            Text("Transaction Fee (billed to source)", style: context.textTheme.headline4),
            VerySmallFormDivider(),
            Text(ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)).asString(myLocale.languageCode) + " ICP",
                style: context.textTheme.bodyText1),
            VerySmallFormDivider()
          ],
        ),
      ),
    ));
  }
}
