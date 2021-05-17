import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/proposal/new_proposal_dialog.dart';

import '../../../dfinity.dart';

class NeuronProposalsCard extends StatelessWidget {

  final Neuron neuron;

  const NeuronProposalsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text("Proposals",
                      style: context.textTheme.headline3),
                ),
              ],
            ),
            ...neuron.proposals.map((e) => Container(
              padding: EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(e.summary.toString(), style: context.textTheme.headline4,),
                  Text(e.url, style: context.textTheme.bodyText1),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
