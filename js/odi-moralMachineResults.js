define([
  'core/js/adapt',
  './moralMachineResultsModel',
  './moralMachineResultsView'
], function(Adapt, MoralMachineResultsModel, MoralMachineResultsView) {

  return Adapt.register("moralMachineResults", {
    model: MoralMachineResultsModel,
    view: MoralMachineResultsView
  });

});
