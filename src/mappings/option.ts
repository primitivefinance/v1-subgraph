import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { UpdatedCacheBalances } from '../../generated/OptionFactory/Option';
import { getToken, getOption, getMarket, bigDecimalizeToken } from './helpers';

export function handleEvent_OptionUpdatedCacheBalances(
  event: UpdatedCacheBalances
): void {
  let option = getOption(event.address);
  let market = getMarket(option.market);
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
