import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/ui.dart';
import 'package:dfinity_wallet/dfinity.dart';

import 'cansiter_name_widget.dart';

class CansitersPage extends StatefulWidget {
  @override
  _CansitersPageState createState() => _CansitersPageState();
}

class _CansitersPageState extends State<CansitersPage> {
  late Timer timer;

  @override
  void initState() {
    super.initState();

    timer = Timer.periodic(1.seconds, (timer) {
      if (context.findRenderObject() != null) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
    timer.cancel();
  }

  @override
  Widget build(BuildContext context) {
    // return NodeWorld();
    return Column(
      children: [
        Expanded(
          child: FooterGradientButton(
            footerHeight: null,
            body: ConstrainWidthAndCenter(
              child: TabTitleAndContent(
                title: "Deploy",
                subtitle:
                    "Deploy applications to canisters; Canisters are computational units, a canister executes your application and consumes cycles.",
                children: [
                  SmallFormDivider(),
                  ...context.boxes.canisters.values
                      .mapToList((e) => CanisterRow(
                            canister: e,
                            showsWarning: true,
                            onPressed: () {
                              context.nav.push(CanisterPageDef.createPageConfig(e));
                            },
                          )),
                ],
              ),
            ),
            footer: Align(
              alignment: Alignment.bottomCenter,
              child: IntrinsicHeight(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: ElevatedButton(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: SizedBox(
                        width: 400,
                        child: Center(
                          child: Text(
                            "Add Canister",
                            textAlign: TextAlign.center,
                            style: context.textTheme.button
                                ?.copyWith(fontSize: 24),
                          ),
                        ),
                      ),
                    ),
                    onPressed: () {
                      OverlayBaseWidget.show(
                          context,
                          NewTransactionOverlay(
                            rootTitle: "Create Canister",
                            rootWidget: CanisterNameWidget(),
                          ),
                          borderRadius: 20);
                    },
                  ),
                ),
              ),
            ),
          ),
        )
      ],
    );
  }
}

class CanisterRow extends StatelessWidget {
  final Canister canister;
  final bool showsWarning;
  final VoidCallback onPressed;

  const CanisterRow(
      {Key? key,
      required this.canister,
      required this.onPressed,
      this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  canister.name,
                  style: context.textTheme.headline3,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  "Balance: ${canister.cyclesRemaining}",
                  style: context.textTheme.bodyText1,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
