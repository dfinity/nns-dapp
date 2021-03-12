import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/app_state.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/ui.dart';

class CansitersTabWidget extends StatefulWidget {
  @override
  _CansitersTabWidgetState createState() => _CansitersTabWidgetState();
}

class _CansitersTabWidgetState extends State<CansitersTabWidget> {

  late Timer timer;

  @override
  void initState() {
    super.initState();

    timer = Timer.periodic(1.seconds, (timer) {
      if(context.findRenderObject() != null){
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
    return Column(
      children: [
        Expanded(
          child: TabTitleAndContent(
            title: "Canisters",
            children: [EitherWidget(
                    condition: AppState.shared.canisters.isEmpty,
                    trueWidget: Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 100),
                        child: SizedBox(
                          width: 400,
                          height: 400,
                          child: Text(
                            "Canisters are computational units.  \n\nA canister executes your application, and consumes cycles.",
                            style: context.textTheme.bodyText1,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ),
                    falseWidget: Column(
                      children: AppState.shared.canisters.mapToList((e) => CanisterRow(
                        canister: e,
                        showsWarning: true,
                        onPressed: (){

                        },
                      )),
                    ))],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(8.0),
          color: AppColors.gray600,
          child: SizedBox(
            height: 80,
            width: double.infinity,
            child: ElevatedButton(
              child: Text(
                "New Canister",
                style: context.textTheme.bodyText1?.copyWith(fontSize: 24),
              ),
              onPressed: () {
                showDialog(
                        context: context,
                        builder: (context) => Center(
                                child: SizedBox(
                                        width: 500,
                                        child: TextFieldDialogWidget(
                                                title: "New Canister",
                                                buttonTitle: "Create",
                                                fieldName: "Canister Name",
                                                onComplete: (name) {
                                                  setState(() {
                                                    AppState.shared.canisters.add(Canister(name, WalletService.uuid.v4()));
                                                  });
                                                }))));
              },
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

  const CanisterRow({Key? key, required this.canister, required this.onPressed, this.showsWarning = false}) : super(key: key);

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
                  style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  "Balance: ${canister.cyclesRemaining}",
                  style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                ),
              ),
              if(canister.cyclesRemaining == 0 && showsWarning)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      "Out of cycles - Open a wallet to top up",
                      style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
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
