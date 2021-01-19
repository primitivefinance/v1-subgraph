import { Address, log } from '@graphprotocol/graph-ts';
import { Option, UniswapPair } from '../../generated/schema';
import {
  Transfer,
  Swap,
  Sync,
  UniswapPair as UniswapPairContract,
} from '../../generated/templates/UniswapPair/UniswapPair';
import { BIGINT_ZERO } from './constants';
import {
  bigDecimalizeToken,
  recordTransaction,
  updateLiquidityPosition,
} from './helpers';

/**
 * This method is called by the indexer whenever it finds the event
 * @dev Emitted whenever liquidity is added or removed or transferred to other wallets
 * @param event contains event params and other info like tx, block
 */
export function handleEvent_Transfer(event: Transfer): void {
  updateLiquidityPosition(event.address, event.params.from);
  updateLiquidityPosition(event.address, event.params.to);
}

/**
 * This method is called by the indexer whenever it finds the event
 * @param event contains event params and other info like tx, block
 */
export function handleEvent_Swap(event: Swap): void {
  let uniswapPair = UniswapPair.load(event.address.toHexString());

  if (uniswapPair !== null) {
    // guessing token0 as short token, will flip if that's not the case
    let _shortVolumeNewRaw = event.params.amount0In
      .minus(event.params.amount0Out)
      .abs();
    let _underlyingVolumeNewRaw = event.params.amount1In
      .minus(event.params.amount1Out)
      .abs();
    let isSwapShortForUnderlying = event.params.amount0In
      .minus(event.params.amount0Out)
      .gt(BIGINT_ZERO);

    // retrieving actual token0 address of this pair by making a call
    let uniswapPairContract = UniswapPairContract.bind(event.address);
    let callResult = uniswapPairContract.try_token0();
    if (callResult.reverted) {
      log.debug(
        'customlogs: uniswapPairContract.try_token0() reverted for {}',
        [event.address.toHexString()]
      );
      return; // halt execution
    } else if (
      !callResult.value.equals(Address.fromString(uniswapPair.shortToken))
    ) {
      // guess was wrong flipping values
      let temp = _shortVolumeNewRaw;
      _shortVolumeNewRaw = _underlyingVolumeNewRaw;
      _underlyingVolumeNewRaw = temp;
      isSwapShortForUnderlying = !isSwapShortForUnderlying;
    }

    // adding the volume and writing to storage
    uniswapPair.shortVolume = uniswapPair.shortVolume.plus(
      bigDecimalizeToken(_shortVolumeNewRaw, uniswapPair.shortToken)
    );
    uniswapPair.underlyingVolume = uniswapPair.underlyingVolume.plus(
      bigDecimalizeToken(_underlyingVolumeNewRaw, uniswapPair.underlyingToken)
    );
    uniswapPair.save();

    let option = Option.load(uniswapPair.option);
    if (option !== null) {
      recordTransaction(
        event.transaction.hash.toHexString(),
        event.block.number,
        event.block.timestamp,
        option.factory,
        option.market,
        option.id,
        isSwapShortForUnderlying ? 'CLOSE_SHORT' : 'SHORT'
      );
    }
  }
}

/**
 * This method is called by the indexer whenever it finds the event
 * @param event contains event params and other info like tx, block
 */
export function handleEvent_Sync(event: Sync): void {
  let uniswapPair = UniswapPair.load(event.address.toHexString());

  if (uniswapPair !== null) {
    // guessing token0 as short token, will flip if that's not the case
    let _shortReserveNewRaw = event.params.reserve0;
    let _underlyingReserveNewRaw = event.params.reserve1;

    // retrieving actual token0 address of this pair by making a call
    let uniswapPairContract = UniswapPairContract.bind(event.address);
    let callResult = uniswapPairContract.try_token0();
    if (callResult.reverted) {
      log.debug(
        'customlogs: uniswapPairContract.try_token0() reverted for {}',
        [event.address.toHexString()]
      );
      return; // halt execution
    } else if (
      !callResult.value.equals(Address.fromString(uniswapPair.shortToken))
    ) {
      // guess was wrong flipping values
      _shortReserveNewRaw = event.params.reserve1;
      _underlyingReserveNewRaw = event.params.reserve0;
    }

    // let shortReserveOld = uniswapPair.shortReserve;
    // let underlyingReserveOld = uniswapPair.underlyingReserve;

    // writing new reserves to storage
    uniswapPair.shortReserve = bigDecimalizeToken(
      _shortReserveNewRaw,
      uniswapPair.shortToken
    );
    uniswapPair.underlyingReserve = bigDecimalizeToken(
      _underlyingReserveNewRaw,
      uniswapPair.underlyingToken
    );
    uniswapPair.save();
  }
}
