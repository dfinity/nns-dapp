
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';

class WalletRow extends StatelessWidget {
    final Wallet wallet;
    final Function onTap;

    const WalletRow({Key? key, required this.wallet, required this.onTap}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Card(
            color: Color(0xff292A2E),
            margin: EdgeInsets.only(left: 16, right: 16, bottom: 16),
            child: FlatButton(
                onPressed: () {
                    this.onTap();
                },
                child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(16),
                    child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    Padding(
                                        padding: const EdgeInsets.all(16.0),
                                        child: Text(
                                            wallet.name,
                                            style: context.textTheme.headline3,
                                        ),
                                    ),
                                    Padding(
                                        padding: const EdgeInsets.only(left: 16.0, bottom: 16.0, right: 16.0),
                                        child: Text(
                                            wallet.address.characters.take(20).toString() + "...",
                                            style: context.textTheme.bodyText2?.copyWith(color: AppColors.gray800),
                                        ),
                                    )
                                ],
                            ),
                            Expanded(child: Container()),
                            BalanceDisplayWidget(amount: wallet.icpBalance, amountSize: 30, icpLabelSize: 20)
                        ],
                    ),
                ),
            ),
        );
    }
}
