import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';

class CanisterDetailWidget extends StatefulWidget {
  final Canister canister;

  const CanisterDetailWidget(this.canister, {Key? key}) : super(key: key);
  @override
  _CanisterDetailWidgetState createState() => _CanisterDetailWidgetState();
}

class _CanisterDetailWidgetState extends State<CanisterDetailWidget> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Canister"),
        backgroundColor: AppColors.background,
      ),
      body: Container(
          color: AppColors.lightBackground,
          child: StreamBuilder<Object>(
              stream: context.icApi.hiveBoxes.accounts.watch(key: widget.canister.identifier),
              builder: (context, snapshot) {
                return FooterGradientButton(
                    body: ListView(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.canister.name,
                                      style: context.textTheme.headline1,
                                    ),
                                    SizedBox(
                                      height: 10,
                                    ),
                                    SelectableText(
                                      widget.canister.identifier,
                                      style: context.textTheme.subtitle2,
                                    )
                                  ],
                                ),
                              ),
                            ),
                            Padding(
                                padding: EdgeInsets.all(24),
                                child: BalanceDisplayWidget(
                                  amount: widget.canister.cyclesRemaining.toDouble(),
                                  amountSize: 40,
                                  icpLabelSize: 25,
                                )),
                          ],
                        ),
                        SizedBox(
                          height: 200,
                        )
                      ],
                    ),
                    footer: Center(
                      child: ElevatedButton(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text(
                              "Add Cycles",
                              style: context.textTheme.button?.copyWith(fontSize: 24),
                            ),
                          ),
                          onPressed: () {

                          }),
                    ));
              }
          )),
    );
  }
}

final red = Color(0xfffefefe);

class _SelectAccountWidget extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Select Account",
                  style: context.textTheme.headline3,
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
                      children: context.boxes.accounts.values
                          .mapToList((e) => _AccountRow(
                          account: e,
                          onPressed: () {
                            NewTransactionOverlay.of(context).pushPage(
                                "Enter ICP Amount",
                                EnterAmountPage(
                                  origin: widget.source,
                                  destinationAccountIdentifier: e.accountIdentifier,
                                ));
                          })),
                    ),
                  ),
                )
              ]),
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
    return FlatButton(
      onPressed: onPressed,
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    account.name,
                    style: context.textTheme.headline3,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 16.0, bottom: 16.0, right: 16.0),
                  child: Text(
                    account.accountIdentifier,
                    style: context.textTheme.bodyText2,
                  ),
                )
              ],
            ),
          ),
          BalanceDisplayWidget(
              amount: account.balance.toBigInt.toICPT,
              amountSize: 30, icpLabelSize: 20)
        ],
      ),
    );
  }
}

