import { DeployCloneCall } from '../generated/OptionFactory/OptionFactory';
import { getFactory, getOption } from './helpers';

export function handleCall_deployClone(call: DeployCloneCall): void {
  let factory = getFactory();
  factory.optionCount += 1;
  let optionAddr = call.outputs.value0;
  getOption(optionAddr);
}
