import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../nns_dapp.dart';

class SelectCyclesOriginWidget extends StatelessWidget {
  final Function(Account account, BuildContext context) onSelected;

  const SelectCyclesOriginWidget({Key? key, required this.onSelected})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Select ICP Source Account",
                        style: Responsive.isMobile(context)
                            ? context.textTheme.headline4
                            : context.textTheme.headline3,
                      ),
                      SmallFormDivider(),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Container(
                          decoration: ShapeDecoration(
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  side: BorderSide(
                                      width: 2, color: AppColors.gray800))),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: context.boxes.accounts.values
                                .mapToList((e) => _AccountRow(
                                    account: e,
                                    onPressed: () {
                                      onSelected(e, context);
                                    })),
                          ),
                        ),
                      )
                    ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AccountRow extends StatelessWidget {
  final Account account;
  final VoidCallback onPressed;
  final bool selected;

  const _AccountRow(
      {Key? key,
      required this.account,
      required this.onPressed,
      this.selected = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  account.name,
                  style: Responsive.isMobile(context)
                      ? context.textTheme.headline4
                      : context.textTheme.headline3,
                ),
                BalanceDisplayWidget(
                  amount: account.balance,
                  amountSize: Responsive.isMobile(context) ? 14 : 30,
                  icpLabelSize: 25,
                ),
              ],
            ),
            SmallFormDivider(),
            Text(
              account.accountIdentifier,
              style: context.textTheme.bodyText1,
            )
          ],
        ),
      ),
    );
  }
}
