import { Option } from '../../generated/schema';
import {
  AddShortLiquidityWithUnderlyingCall,
  RemoveShortLiquidityThenCloseOptionsCall,
  FlashMintShortOptionsThenSwapCall,
  FlashCloseLongOptionsThenSwapCall,
} from '../../generated/UniswapConnector03/UniswapConnector03';
import { recordTransaction } from './helpers';

export function handleCall_addShortLiquidityWithUnderlying(
  call: AddShortLiquidityWithUnderlyingCall
): void {
  let option = Option.load(call.inputs.optionAddress.toHexString());
  if (option !== null) {
    recordTransaction(
      call.transaction.hash.toHexString(),
      call.block.number,
      call.block.timestamp,
      option.factory,
      option.market,
      option.id,
      'ADD_LIQUIDITY'
    );
  }
}

export function handleCall_removeShortLiquidityThenCloseOptionsCall(
  call: RemoveShortLiquidityThenCloseOptionsCall
): void {
  let option = Option.load(call.inputs.optionAddress.toHexString());
  if (option !== null) {
    recordTransaction(
      call.transaction.hash.toHexString(),
      call.block.number,
      call.block.timestamp,
      option.factory,
      option.market,
      option.id,
      'REMOVE_LIQUIDITY_CLOSE'
    );
  }
}

export function handleCall_flashMintShortOptionsThenSwap(
  call: FlashMintShortOptionsThenSwapCall
): void {
  let option = Option.load(call.inputs.optionAddress.toHexString());
  if (option !== null) {
    recordTransaction(
      call.transaction.hash.toHexString(),
      call.block.number,
      call.block.timestamp,
      option.factory,
      option.market,
      option.id,
      'LONG'
    );
  }
}

export function handleCall_flashCloseLongOptionsThenSwap(
  call: FlashCloseLongOptionsThenSwapCall
): void {
  let option = Option.load(call.inputs.optionAddress.toHexString());
  if (option !== null) {
    recordTransaction(
      call.transaction.hash.toHexString(),
      call.block.number,
      call.block.timestamp,
      option.factory,
      option.market,
      option.id,
      'WRITE'
    );
  }
}

// export function handleEvent_ConnectorFlashOpened(event: FlashOpened): void {
//   let option = Option.load(uniswapPair.option);
//   if (option !== null) {
//     recordTransaction(
//       event.transaction.hash.toHexString(),
//       event.block.number,
//       event.block.timestamp,
//       option.factory,
//       option.market,
//       option.id,
//       isSwapShortForUnderlying ? 'CLOSE_SHORT' : 'Short'
//     );
//   }
// }
