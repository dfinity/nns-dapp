import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';
import 'package:nns_dapp/ui/neurons/tab/neuron_row.dart';
import 'package:nns_dapp/ui/transaction/wallet/merge_neuron_destination_page.dart';

import '../../../nns_dapp.dart';
import '../wizard_overlay.dart';

class MergeNeuronSourceAccount extends StatefulWidget {
  MergeNeuronSourceAccount();

  @override
  _MergeNeuronSourceAccountState createState() => _MergeNeuronSourceAccountState();
}

class _MergeNeuronSourceAccountState extends State<MergeNeuronSourceAccount> {
  late ValidatedTextField amountField;
  int maxSelectedCards = 2;
  int currentSelectedCards = 0;
  bool isCardSelected = false;

  final selectedAccounts = [];
  final selectedAccountsColor = []; //[Colors.transparent, Colors.transparent];

  get index => null;
  @override
  Widget build(BuildContext context) {
    final allAccounts = (context.boxes.neurons.values
        ?.sortedByDescending((element) => element.createdTimestampSeconds.toBigInt))?.toList(growable: true);
    if (allAccounts != null && selectedAccountsColor.length != allAccounts.length) {
      selectedAccountsColor.length = allAccounts.length;
      selectedAccounts.length = 1;
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
                                        selectedAccounts.add(allAccounts[index]
                                            .id); //TODO: am i passing neuron id or whole neuron to back end ?
                                      }
                                      print("Number of selected cards is : $currentSelectedCards");
                                      //  print('selectedAccounts values after adding elements are :');
                                      for (int i = 0; i < selectedAccounts.length; i++) print(selectedAccounts[i]);
                                    } else {
                                      if (currentSelectedCards == maxSelectedCards) {
                                        if (selectedAccountsColor[index] == Colors.grey.shade800) {
                                          selectedAccountsColor[index] = Colors.transparent;
                                          currentSelectedCards -= 1;
                                          selectedAccounts.remove(allAccounts[index].id);

                                          // print('selectedAccounts values after removing elements are :');
                                          for (int i = 0; i < selectedAccounts.length; i++) print(selectedAccounts[i]);
                                        }
                                      }
                                    }
                                    // if (currentSelectedCards < maxSelectedCards) {
                                    //   if (selectedAccountsColor[index] == Colors.grey.shade800) {
                                    //     selectedAccountsColor[index] = Colors.transparent;
                                    //     currentSelectedCards -= 1;
                                    //   } else {
                                    //     selectedAccountsColor[index] = Colors.grey.shade800;
                                    //     currentSelectedCards += 1;
                                    //   }
                                    //   print("Number of selected cards is : $currentSelectedCards");
                                    // } else {
                                    //   if (currentSelectedCards == maxSelectedCards) {
                                    //     if (selectedAccountsColor[index] == Colors.grey.shade800) {
                                    //       selectedAccountsColor[index] = Colors.transparent;
                                    //       currentSelectedCards -= 1;
                                    //     }
                                    //   }
                                    // }
                                  });

                                  // setState(() {
                                  //   isCardSelected = !isCardSelected;
                                  // });

                                  // if (currentSelectedCards < maxSelectedCards) {
                                  //   setState(() {
                                  //     currentSelectedCards += 1;
                                  //   });
                                  // }
                                  // final address = e.identifier;
                                  // print("Neuron address is : $address");
                                  // final source =
                                  //     context.boxes.neurons[address]!;
                                  // print('Neuron source is : $source');
                                  // WizardOverlay.of(context).pushPage(
                                  //     "Select Destination",
                                  //     SelectDestinationNeuronAccountPage(
                                  //         source: source));
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
                      title: "Confirm you want to merge these neurons",
                      description: "This will merge the selected neurons . This process is irreversible",
                      onConfirm: () async {
                        //  await performUpdate(context);
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
}
