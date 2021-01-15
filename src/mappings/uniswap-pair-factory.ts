import { Address, log } from '@graphprotocol/graph-ts';
import { Token, UniswapPair, Option } from '../../generated/schema';
import { PairCreated } from '../../generated/UniswapFactory/UniswapFactory';
import { Redeem } from '../../generated/OptionFactory/Redeem';
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
      log.debug(
        'customlogs: ignoring UniswapPair: token0 {} kind is {} & token1 {} kind is {}',
        [token0.id, token0.kind, token1.id, token1.kind]
      );
      return;
    }

    let uniswapPair = UniswapPair.load(event.params.pair.toHexString());
    if (uniswapPair !== null) {
      log.debug('customlogs: UniswapPair entity already exists for id {}', [
        event.params.pair.toHexString(),
      ]);
    } else {
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

      let redeemContract = Redeem.bind(Address.fromString(redeemToken.id));
      let callResult = redeemContract.try_optionToken();
      if (callResult.reverted) {
        log.debug(
          `customlogs: redeemContract.try_optionToken() reverted for contract {}`,
          [redeemToken.id]
        );
      } else {
        let optionTokenAddr = callResult.value;
        let option = Option.load(optionTokenAddr.toHexString());
        if (option === null) {
          log.debug('customlogs: Option entity does not exists for id {}', [
            optionTokenAddr.toHexString(),
          ]);
        } else {
          // adding one-to-one relationship
          option.uniswapPair = uniswapPair.id;
          option.save();
          uniswapPair.option = option.id;
          log.debug('customlogs: uniswapPair.option = {}', [option.id]);
        }
      }

      uniswapPair.save();
    }
  }
}
