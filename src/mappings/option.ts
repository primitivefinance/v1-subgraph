import { Market, Option } from '../../generated/schema';
import {
  UpdatedCacheBalances,
  Mint,
  Transfer,
} from '../../generated/OptionFactory/Option';
import { Option as OptionContract } from '../../generated/OptionFactory/Option';
import {
  bigDecimalizeToken,
  convertBigIntToBigDecimal,
  getToken,
  recordTransaction,
  updateOptionPosition,
} from './helpers';

/**
 * This method is called by the indexer whenever it finds the event
 * @dev Emitted whenever liquidity is added or removed or transferred to other wallets
 * @param event contains event params and other info like tx, block
 */
export function handleEvent_Transfer(event: Transfer): void {
  updateOptionPosition(
    event.address,
    event.params.from,
    event.block.number,
    event.block.timestamp
  );
  updateOptionPosition(
    event.address,
    event.params.to,
    event.block.number,
    event.block.timestamp
  );
}

/**
 * This method is called by the indexer whenever it finds the event
 * @param event contains event params and other info like tx, block
 */
export function handleEvent_UpdatedCacheBalances(
  event: UpdatedCacheBalances
): void {
  let option = Option.load(event.address.toHexString());
  let market = Market.load(option.market);
  let underlyingLockedOld = option.underlyingLocked;
  let strikeLockedOld = option.strikeLocked;

  let underlyingLockedNew = bigDecimalizeToken(
    event.params.underlyingCache,
    option.underlyingToken
  );
  let strikeCacheNew = bigDecimalizeToken(
    event.params.strikeCache,
    option.strikeToken
  );

  option.underlyingLocked = underlyingLockedNew;
  option.strikeLocked = strikeCacheNew;
  option.save();

  market.totalUnderlyingLocked = market.totalUnderlyingLocked
    .minus(underlyingLockedOld)
    .plus(underlyingLockedNew);
  market.totalStrikeLocked = market.totalStrikeLocked
    .minus(strikeLockedOld)
    .plus(strikeCacheNew);
  market.save();
}

/**
 * This method is called by the indexer whenever it finds the event
 * @param event contains event params and other info like tx, block
 */
export function handleEvent_Mint(event: Mint): void {
  let option = Option.load(event.address.toHexString());
  recordTransaction(
    event.transaction.hash.toHexString(),
    event.block.number,
    event.block.timestamp,
    option.factory,
    option.market,
    event.address.toHexString(),
    'MINT'
  );

  // update total supply
  let optionContract = OptionContract.bind(event.address);
  let optionTotalSupplyResult = optionContract.try_totalSupply();
  if (!optionTotalSupplyResult.reverted) {
    option.openInterest = convertBigIntToBigDecimal(
      optionTotalSupplyResult.value,
      getToken(event.address).decimals
    );
    option.save();
  }
}
