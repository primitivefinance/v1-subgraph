import { BigInt } from "@graphprotocol/graph-ts";
import {
  Contract,
  Approval,
  Buy,
  Deposit,
  Market,
  OwnershipTransferred,
  Paused,
  Transfer,
  Unpaused,
  Withdraw,
} from "../generated/Contract/Contract";
import {
  DepositEventPool,
  WithdrawEventPool,
  BuyEventPool,
} from "../generated/schema";

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex());
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  // if (entity == null) {
  //   entity = new ExampleEntity(event.transaction.from.toHex());
  //   // Entity fields can be set using simple assignments
  //   // entity.count = BigInt.fromI32(0);
  // }
  // // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1);
  // // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner;
  // entity.spender = event.params.spender;
  // Entities can be written to the store with `.save()`
  // entity.save();
  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.
  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.COMPOUND_DAI(...)
  // - contract.ONE_ETHER(...)
  // - contract.SECONDS_IN_DAY(...)
  // - contract.addMarket(...)
  // - contract.allowance(...)
  // - contract.approve(...)
  // - contract.balanceOf(...)
  // - contract.calculatePremium(...)
  // - contract.calculateVolatilityProxy(...)
  // - contract.decimals(...)
  // - contract.decreaseAllowance(...)
  // - contract.increaseAllowance(...)
  // - contract.kill(...)
  // - contract.name(...)
  // - contract.oracle(...)
  // - contract.owner(...)
  // - contract.paused(...)
  // - contract.poolUtilized(...)
  // - contract.primes(...)
  // - contract.sqrt(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.transfer(...)
  // - contract.transferFrom(...)
  // - contract.volatility(...)
  // - contract.weth(...)
  // - contract.withdraw(...)
}

export function handleBuy(event: Buy): void {
  let entity = new BuyEventPool(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let contract = Contract.bind(event.address);
  entity.from = event.params.user;
  entity.inTokenS = event.params.inTokenS;
  entity.outTokenU = event.params.outTokenU;
  entity.premium = event.params.premium;
  entity.hash = event.transaction.hash.toHex();
}

export function handleDeposit(event: Deposit): void {
  let entity = new DepositEventPool(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.user;
  entity.hash = event.transaction.hash.toHex();
  entity.inTokenU = event.params.inTokenU;
  entity.outTokenPULP = event.params.outTokenPULP;
  entity.save();
}

export function handleMarket(event: Market): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleTransfer(event: Transfer): void {}

export function handleUnpaused(event: Unpaused): void {}

export function handleWithdraw(event: Withdraw): void {
  let entity = new WithdrawEventPool(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  entity.from = event.params.user;
  entity.hash = event.transaction.hash.toHex();
  entity.inTokenS = event.params.inTokenR;
  entity.outTokenS = event.params.outTokenU;
  entity.save();
}
