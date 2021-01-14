import { PairCreated } from '../../generated/UniswapFactory/UniswapFactory';
import { Redeem } from '../../generated/OptionFactory/Redeem';
import { Token, UniswapPair } from '../../generated/schema';
import { getToken, getOption } from './helpers';
import { ZERO_BIGINT, ZERO_BIGDECIMAL } from './constants';

/**
 * This handler is triggered for every new Pair created on Uniswap.
 * Pairs which have Reedem tokens as one of the tokens are processed, rest are ignored.
 * @param event PairCreated event data
 */
export function handleEvent_UniswapPairCreated(event: PairCreated): void {
  let token0 = Token.load(event.params.token0.toHexString());
  let token1 = Token.load(event.params.token1.toHexString());

  // this means this is a Uniswap Pair of some Option's Underlying vs. Redeem tokens
  if (token0 !== null && token1 !== null) {
    // identifiying which of token0 and token1 are redeem
    let redeemToken: Token;
    let underlyingToken: Token;
    if (token0.kind === 'REDEEM') {
      redeemToken = token0 as Token;
      underlyingToken = token1 as Token;
    } else if (token1.kind === 'REDEEM') {
      redeemToken = token1 as Token;
      underlyingToken = token0 as Token;
    } else {
      // halt execution since none of these token is a redeem token
      // example: AAVE & LINK which are both underlying tokens having token.kind === 'OTHER'
      return;
    }

    let uniswapPair = UniswapPair.load(event.params.pair.toHexString());
    if (uniswapPair === null) {
      uniswapPair = new UniswapPair(event.params.pair.toHexString());

      // # tokens
      uniswapPair.shortToken = redeemToken.id;
      uniswapPair.underlyingToken = underlyingToken.id;

      // # uniswap reserves
      uniswapPair.shortReserve = ZERO_BIGDECIMAL;
      uniswapPair.underlyingReserve = ZERO_BIGDECIMAL;

      // # not sure
      // uniswapPair.longDepth = ZERO_BIGDECIMAL;

      // # stats
      uniswapPair.shortVolume = ZERO_BIGDECIMAL;
      uniswapPair.underlyingVolume = ZERO_BIGDECIMAL;
      uniswapPair.txCount = ZERO_BIGINT;
      uniswapPair.liquidityProviderCount = ZERO_BIGINT;

      // # details
      uniswapPair.createdAtTimestamp = event.block.timestamp.toI32();
      uniswapPair.createdAtBlockNumber = event.block.number;

      uniswapPair.save();

      let redeemContract = Redeem.bind(event.params.pair);
      let callResult = redeemContract.try_optionToken();
      if (!callResult.reverted) {
        let optionTokenAddr = callResult.value;
        let option = getOption(optionTokenAddr);
        // adding one-to-one relationship
        option.uniswapPair = uniswapPair.id;
        option.save();
        uniswapPair.option = option.id;
        uniswapPair.save();
      }
    }
  }
}
