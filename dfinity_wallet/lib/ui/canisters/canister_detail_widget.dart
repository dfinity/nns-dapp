import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'enter_cycles_page.dart';

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
              stream: context.icApi.hiveBoxes.accounts.watch(
                  key: widget.canister.identifier),
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
                                  amount: widget.canister.cyclesRemaining
                                      .toDouble(),
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
                              style: context.textTheme.button?.copyWith(
                                  fontSize: 24),
                            ),
                          ),
                          onPressed: () {
                            OverlayBaseWidget.show(context,
                                NewTransactionOverlay(
                                    rootTitle: "Top Up Canister",
                                    rootWidget: SelectCyclesOriginWidget(
                                      destinationCanister: widget.canister,)));
                          }),
                    ));
              }
          )),
    );
  }
}


