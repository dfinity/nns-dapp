import 'package:intl/intl.dart';

import '../../dfinity.dart';

class BalanceDisplayWidget extends StatelessWidget {
    final double amount;
    final int amountSize;
    final int icpLabelSize;

    const BalanceDisplayWidget({Key? key, required this.amount, required this.amountSize, required this.icpLabelSize})
            : super(key: key);

    @override
    Widget build(BuildContext context) {
        var f = NumberFormat("###,###.#", "en_US");
        return Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
                Text(
                    f.format(amount),
                    style: TextStyle(color: AppColors.white, fontFamily: Fonts.circularBold, fontSize: amountSize.toDouble()),
                ),
                SizedBox(
                    width: 10,
                ),
                Text("ICP",
                        style: TextStyle(color: AppColors.white, fontFamily: Fonts.circularBook, fontSize: icpLabelSize.toDouble()))
            ],
        );
    }
}