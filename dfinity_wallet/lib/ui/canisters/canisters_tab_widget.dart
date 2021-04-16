import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';
import 'package:dfinity_wallet/ui/ui.dart';
import 'package:dfinity_wallet/dfinity.dart';

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
                title: "Canisters",
                children: [
                  Container(
                    child: Padding(
                      padding: const EdgeInsets.all(15.0),
                      child: Text(
                        "Canisters are computational units, a canister executes your application and consumes cycles.",
                        style: context.textTheme.bodyText2,
                      ),
                    ),
                  ),
                  SmallFormDivider(),
                  ...context.boxes.canisters.values.mapToList((e) => CanisterRow(
                        canister: e,
                        showsWarning: true,
                        onPressed: () {},
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
                        height: 50,
                        child: Center(
                          child: Text(
                            "Add Canister",
                            textAlign: TextAlign.center,
                            style: context.textTheme.button?.copyWith(fontSize: 24),
                          ),
                        ),
                      ),
                    ),
                    onPressed: () {
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
                  style: context.textTheme.headline3
                      ?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  "Balance: ${canister.cyclesRemaining}",
                  style: context.textTheme.bodyText1
                      ?.copyWith(color: AppColors.gray800),
                ),
              ),
              if (canister.cyclesRemaining == 0 && showsWarning)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      "Out of cycles - Open a wallet to top up",
                      style: context.textTheme.bodyText1
                          ?.copyWith(color: AppColors.gray800),
                    ),
                  ),
                )
            ],
          ),
        ),
      ),
    );
  }
}
