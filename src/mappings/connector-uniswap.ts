import { Option } from '../../generated/schema';
import { Option as OptionContract } from '../../generated/OptionFactory/Option';
import {
  AddShortLiquidityWithUnderlyingCall,
  RemoveShortLiquidityThenCloseOptionsCall,
  FlashMintShortOptionsThenSwapCall,
  FlashCloseLongOptionsThenSwapCall,
} from '../../generated/UniswapConnector03/UniswapConnector03';
import { recordTransaction, linkUserWithTransaction } from './helpers';
import { BIGINT_ZERO } from './constants';

/**
 * This method is called by the indexer whenever it finds call
 * @param call contains inputs outputs and other tx, block info
 */
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
    linkUserWithTransaction(
      call.inputs.to.toHexString(),
      call.transaction.hash.toHexString()
    );
  }
}

/**
 * This method is called by the indexer whenever it finds call
 * @param call contains inputs outputs and other tx, block info
 */
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
    linkUserWithTransaction(
      call.inputs.to.toHexString(),
      call.transaction.hash.toHexString()
    );
  }
}

/**
 * This method is called by the indexer whenever it finds call
 * @param call contains inputs outputs and other tx, block info
 */
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
    linkUserWithTransaction(
      call.inputs.to.toHexString(),
      call.transaction.hash.toHexString()
    );
  }
}

/**
 * This method is called by the indexer whenever it finds call
 * @param call contains inputs outputs and other tx, block info
 */
export function handleCall_flashCloseLongOptionsThenSwap(
  call: FlashCloseLongOptionsThenSwapCall
): void {
  // WRITE = if user doesnt have option token balance
  // CLOSE_LONG = if user does have option token balance
  let orderType = 'WRITE';
  let optionContract = OptionContract.bind(call.inputs.optionAddress);
  let result = optionContract.try_balanceOf(call.inputs.to);
  if (!result.reverted && result.value.gt(BIGINT_ZERO)) {
    orderType = 'CLOSE_LONG';
  }

  let option = Option.load(call.inputs.optionAddress.toHexString());
  if (option !== null) {
    recordTransaction(
      call.transaction.hash.toHexString(),
      call.block.number,
      call.block.timestamp,
      option.factory,
      option.market,
      option.id,
      orderType
    );
    linkUserWithTransaction(
      call.inputs.to.toHexString(),
      call.transaction.hash.toHexString()
    );
  }
}
