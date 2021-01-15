import { Address, log, BigInt } from '@graphprotocol/graph-ts';
import { UniswapPair } from '../../generated/schema';
import {
  Mint,
  Swap,
  Sync,
  UniswapPair as UniswapPairContract,
} from '../../generated/templates/UniswapPair/UniswapPair';
import { bigDecimalizeToken } from './helpers';

export function handleEvent_UniswapPairMint(event: Mint): void {
  let uniswapPair = UniswapPair.load(event.address.toHexString());

  if (uniswapPair !== null) {
    uniswapPair.liquidityProviderCount = uniswapPair.liquidityProviderCount.plus(
      BigInt.fromI32(1)
    );
    uniswapPair.save();
  }
}

export function handleEvent_UniswapPairSwap(event: Swap): void {}

export function handleEvent_UniswapPairSync(event: Sync): void {
  let uniswapPair = UniswapPair.load(event.address.toHexString());

  if (uniswapPair !== null) {
    // guessing token0 as short token, will flip if that's not the case
    let _shortReserveRaw = event.params.reserve0;
    let _underlyingReserveRaw = event.params.reserve1;

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
      _shortReserveRaw = event.params.reserve1;
      _underlyingReserveRaw = event.params.reserve0;
    }

    // let shortReserveOld = uniswapPair.shortReserve;
    // let underlyingReserveOld = uniswapPair.underlyingReserve;

    // writing new reserves to storage
    uniswapPair.shortReserve = bigDecimalizeToken(
      _shortReserveRaw,
      uniswapPair.shortToken
    );
    uniswapPair.underlyingReserve = bigDecimalizeToken(
      _underlyingReserveRaw,
      uniswapPair.underlyingToken
    );
    uniswapPair.save();
  }
}
