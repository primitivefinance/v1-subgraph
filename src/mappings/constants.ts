import { BigInt, BigDecimal } from '@graphprotocol/graph-ts';

export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = BigDecimal.fromString('0');
export let BIGDECIMAL_ONE = BigDecimal.fromString('1');

export let orderTypePriority = new Array<string>(18);

orderTypePriority[0] = 'NONE';
orderTypePriority[1] = 'MINT';
orderTypePriority[2] = 'EXERCISE';
orderTypePriority[3] = 'REDEEM';
orderTypePriority[4] = 'CLOSE';
orderTypePriority[5] = 'UNWIND';
orderTypePriority[6] = 'NEUTRAL';
orderTypePriority[7] = 'NEW_MARKET';
orderTypePriority[8] = 'APPROVE';
orderTypePriority[9] = 'LONG';
orderTypePriority[10] = 'SHORT';
orderTypePriority[11] = 'WRITE';
orderTypePriority[12] = 'CLOSE_LONG';
orderTypePriority[13] = 'CLOSE_SHORT';
orderTypePriority[14] = 'ADD_LIQUIDITY_CUSTOM'; // Uniswap Swap event
orderTypePriority[15] = 'ADD_LIQUIDITY';
orderTypePriority[16] = 'REMOVE_LIQUIDITY_CUSTOM'; // Uniswap Swap event
orderTypePriority[17] = 'REMOVE_LIQUIDITY_CLOSE';
