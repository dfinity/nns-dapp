class ForceRemovalCriteria {
    final double distance;
    final double velocity;

    ForceRemovalCriteria({this.distance, this.velocity});

    bool shouldRemove(double currentDistance, double currentVelocity) {
        if (distance != null && velocity != null) {
            return currentDistance < distance && currentVelocity < velocity;
        } else if (distance != null) {
            return currentDistance < distance;
        } else if (velocity != null) {
            return currentVelocity < velocity;
        } else {
            return false;
        }
    }
}
