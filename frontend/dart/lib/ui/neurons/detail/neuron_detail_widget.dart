import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/following/neuron_followees_card.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_rewards_card.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_state_card.dart';
import 'package:dfinity_wallet/ui/neurons/proposal/neuron_proposals_card.dart';
import '../../../dfinity.dart';
import 'neuron_votes_card.dart';

const DEPLOY_ENV = String.fromEnvironment('DEPLOY_ENV');

class NeuronDetailWidget extends StatefulWidget {
  final Neuron neuron;

  const NeuronDetailWidget(this.neuron, {Key? key}) : super(key: key);

  @override
  _NeuronDetailWidgetState createState() => _NeuronDetailWidgetState();
}

class _NeuronDetailWidgetState extends State<NeuronDetailWidget> {


  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    context.icApi.fetchNeuron(neuronId: widget.neuron.identifier.toBigInt);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: AppColors.lightBackground,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          title: Text("Neuron"),
        ),
        body: StreamBuilder<Object>(
          stream: context.boxes.neurons.changes,
          builder: (context, snapshot) {
            return SingleChildScrollView(
              child: ConstrainWidthAndCenter(
                child: Container(
                  color: AppColors.lightBackground,
                  child: Column(
                    children: [
                      SmallFormDivider(),
                      NeuronStateCard(neuron: widget.neuron),
                      NeuronRewardsCard(neuron: widget.neuron),
                      NeuronVotesCard(neuron: widget.neuron),
                      NeuronFolloweesCard(neuron: widget.neuron),
                      if(DEPLOY_ENV == "staging")
                        NeuronProposalsCard(neuron: widget.neuron),

                      TallFormDivider(),
                    ],
                  ),
                ),
              ),
            );
          }
        ));
  }
}
