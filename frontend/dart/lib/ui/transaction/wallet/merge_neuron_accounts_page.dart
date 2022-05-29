import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neurons/tab/neuron_row.dart';
import 'package:universal_html/js.dart' as js;
import '../../../nns_dapp.dart';

class MergeNeuronSourceAccount extends StatefulWidget {
  MergeNeuronSourceAccount({required this.onCompleteAction});

  final Function(BuildContext context) onCompleteAction;

  @override
  _MergeNeuronSourceAccountState createState() => _MergeNeuronSourceAccountState();
}

class _MergeNeuronSourceAccountState extends State<MergeNeuronSourceAccount> {
  late ValidatedTextField amountField;
  int maxSelectedCards = 2;
  int currentSelectedCards = 0;
  bool isCardSelected = false;

  final selectedAccounts = [].toList(growable: true);
  final selectedAccountsColor = [];

  get index => null;
  @override
  Widget build(BuildContext context) {
    final allAccounts = (context.boxes.neurons.values
        ?.sortedByDescending((element) => element.createdTimestampSeconds.toBigInt))?.toList(growable: true);
    if (allAccounts != null && selectedAccountsColor.length != allAccounts.length) {
      selectedAccountsColor.length = allAccounts.length;
      for (int i = 0; i < selectedAccountsColor.length; i++) selectedAccountsColor[i] = Colors.transparent;
    }

    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (allAccounts!.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(
                    "My Neurons",
                    style: Responsive.isDesktop(context) | Responsive.isTablet(context)
                        ? context.textTheme.headline3
                        : context.textTheme.headline4,
                  ),
                  SmallFormDivider(),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      height: Responsive.isMobile(context) ? 300 : 400.0,
                      decoration: ShapeDecoration(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(width: 2, color: AppColors.gray800))),
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: allAccounts.length,
                        itemBuilder: (context, index) {
                          return Column(
                            children: [
                              TextButton(
                                style: ButtonStyle(
                                    backgroundColor: MaterialStateProperty.all(selectedAccountsColor[index])),
                                onPressed: () {
                                  setState(() {
                                    if (currentSelectedCards < maxSelectedCards) {
                                      if (selectedAccountsColor[index] == Colors.grey.shade800) {
                                        selectedAccountsColor[index] = Colors.transparent;
                                        selectedAccounts.remove(allAccounts[index].id);
                                        currentSelectedCards -= 1;
                                      } else {
                                        selectedAccountsColor[index] = Colors.grey.shade800;
                                        currentSelectedCards += 1;
                                        selectedAccounts.add(allAccounts[index].id);
                                      }
                                    } else {
                                      if (currentSelectedCards == maxSelectedCards) {
                                        if (selectedAccountsColor[index] == Colors.grey.shade800) {
                                          selectedAccountsColor[index] = Colors.transparent;
                                          currentSelectedCards -= 1;
                                          selectedAccounts.remove(allAccounts[index].id);
                                        }
                                      }
                                    }
                                  });
                                },
                                child: Padding(
                                  padding: const EdgeInsets.only(left: 8.0, right: 8.0, top: 10.0, bottom: 60.0),
                                  child: NeuronRow(
                                    neuron: allAccounts[index],
                                    showsWarning: true,
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ),
                ]),
              ),
            ),
          // TallFormDivider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
            child: SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text(
                  "Confirm",
                  style: TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
                ),
                onPressed: () {
                  OverlayBaseWidget.show(
                    context,
                    ConfirmDialog(
                      title: "Confirm Merge Neurons",
                      description: "Are you sure you want to merge these neurons? This process is irreversible",
                      onConfirm: () async {
                        await performUpdate(context);
                      },
                    ),
                  );
                }.takeIf((e) => currentSelectedCards == maxSelectedCards),
              ),
            ),
          )
        ],
      ),
    );
  }

  Future performUpdate(BuildContext context) async {
    final neuronAccounts = context.boxes.neurons.values;
    List<Neuron> neuronsSelected = List.filled(2, Neuron.empty());

    for (int i = 0; i < context.boxes.neurons.length; i++) {
      if (selectedAccounts[0] == neuronAccounts.elementAt(i).id) {
        neuronsSelected[0] = neuronAccounts.elementAt(i);
      } else if (selectedAccounts[1] == neuronAccounts.elementAt(i).id) {
        neuronsSelected[1] = neuronAccounts.elementAt(i);
      }
    }
    final res =
        await context.callUpdate(() => context.icApi.merge(neuron1: neuronsSelected[0], neuron2: neuronsSelected[1]));

    res.when(ok: (unit) {
      // neuron Merge succeeded.
      widget.onCompleteAction(context);
    }, err: (err) {
      // neruon merge failed. Display the error.
      js.context.callMethod("alert", ["$err"]);
    });
  }
}
