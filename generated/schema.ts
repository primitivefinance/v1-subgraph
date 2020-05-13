// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class DepositEventPool extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save DepositEventPool entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save DepositEventPool entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("DepositEventPool", id.toString(), this);
  }

  static load(id: string): DepositEventPool | null {
    return store.get("DepositEventPool", id) as DepositEventPool | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get inTokenU(): BigInt {
    let value = this.get("inTokenU");
    return value.toBigInt();
  }

  set inTokenU(value: BigInt) {
    this.set("inTokenU", Value.fromBigInt(value));
  }

  get outTokenPULP(): BigInt {
    let value = this.get("outTokenPULP");
    return value.toBigInt();
  }

  set outTokenPULP(value: BigInt) {
    this.set("outTokenPULP", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}

export class WithdrawEventPool extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save WithdrawEventPool entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save WithdrawEventPool entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("WithdrawEventPool", id.toString(), this);
  }

  static load(id: string): WithdrawEventPool | null {
    return store.get("WithdrawEventPool", id) as WithdrawEventPool | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get inTokenS(): BigInt {
    let value = this.get("inTokenS");
    return value.toBigInt();
  }

  set inTokenS(value: BigInt) {
    this.set("inTokenS", Value.fromBigInt(value));
  }

  get outTokenS(): BigInt {
    let value = this.get("outTokenS");
    return value.toBigInt();
  }

  set outTokenS(value: BigInt) {
    this.set("outTokenS", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}

export class BuyEventPool extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save BuyEventPool entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save BuyEventPool entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("BuyEventPool", id.toString(), this);
  }

  static load(id: string): BuyEventPool | null {
    return store.get("BuyEventPool", id) as BuyEventPool | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get inTokenS(): BigInt {
    let value = this.get("inTokenS");
    return value.toBigInt();
  }

  set inTokenS(value: BigInt) {
    this.set("inTokenS", Value.fromBigInt(value));
  }

  get outTokenU(): BigInt {
    let value = this.get("outTokenU");
    return value.toBigInt();
  }

  set outTokenU(value: BigInt) {
    this.set("outTokenU", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }

  get premium(): BigInt {
    let value = this.get("premium");
    return value.toBigInt();
  }

  set premium(value: BigInt) {
    this.set("premium", Value.fromBigInt(value));
  }
}

export class MintEventOption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save MintEventOption entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save MintEventOption entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("MintEventOption", id.toString(), this);
  }

  static load(id: string): MintEventOption | null {
    return store.get("MintEventOption", id) as MintEventOption | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get outTokenP(): BigInt {
    let value = this.get("outTokenP");
    return value.toBigInt();
  }

  set outTokenP(value: BigInt) {
    this.set("outTokenP", Value.fromBigInt(value));
  }

  get outTokenR(): BigInt {
    let value = this.get("outTokenR");
    return value.toBigInt();
  }

  set outTokenR(value: BigInt) {
    this.set("outTokenR", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}

export class SwapEventOption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save SwapEventOption entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save SwapEventOption entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("SwapEventOption", id.toString(), this);
  }

  static load(id: string): SwapEventOption | null {
    return store.get("SwapEventOption", id) as SwapEventOption | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get outTokenU(): BigInt {
    let value = this.get("outTokenU");
    return value.toBigInt();
  }

  set outTokenU(value: BigInt) {
    this.set("outTokenU", Value.fromBigInt(value));
  }

  get inTokenS(): BigInt {
    let value = this.get("inTokenS");
    return value.toBigInt();
  }

  set inTokenS(value: BigInt) {
    this.set("inTokenS", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}

export class RedeemEventOption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save RedeemEventOption entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save RedeemEventOption entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("RedeemEventOption", id.toString(), this);
  }

  static load(id: string): RedeemEventOption | null {
    return store.get("RedeemEventOption", id) as RedeemEventOption | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get inTokenR(): BigInt {
    let value = this.get("inTokenR");
    return value.toBigInt();
  }

  set inTokenR(value: BigInt) {
    this.set("inTokenR", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}

export class CloseEventOption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save CloseEventOption entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save CloseEventOption entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("CloseEventOption", id.toString(), this);
  }

  static load(id: string): CloseEventOption | null {
    return store.get("CloseEventOption", id) as CloseEventOption | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get inTokenP(): BigInt {
    let value = this.get("inTokenP");
    return value.toBigInt();
  }

  set inTokenP(value: BigInt) {
    this.set("inTokenP", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}

export class FundEventOption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save FundEventOption entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save FundEventOption entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("FundEventOption", id.toString(), this);
  }

  static load(id: string): FundEventOption | null {
    return store.get("FundEventOption", id) as FundEventOption | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get cacheU(): BigInt {
    let value = this.get("cacheU");
    return value.toBigInt();
  }

  set cacheU(value: BigInt) {
    this.set("cacheU", Value.fromBigInt(value));
  }

  get cacheS(): BigInt {
    let value = this.get("cacheS");
    return value.toBigInt();
  }

  set cacheS(value: BigInt) {
    this.set("cacheS", Value.fromBigInt(value));
  }

  get cacheR(): BigInt {
    let value = this.get("cacheR");
    return value.toBigInt();
  }

  set cacheR(value: BigInt) {
    this.set("cacheR", Value.fromBigInt(value));
  }

  get hash(): string {
    let value = this.get("hash");
    return value.toString();
  }

  set hash(value: string) {
    this.set("hash", Value.fromString(value));
  }
}