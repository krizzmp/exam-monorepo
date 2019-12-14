import { Field, Int, ObjectType } from "type-graphql";
import {
  Column,
  Entity,
  Exclusion,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";

type Lazy<T extends object> = Promise<T> | T;

@ObjectType()
@Entity()
export class Product {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column("int")
  price: number;

  @Field(() => [LineItem])
  @OneToMany(
    () => LineItem,
    lineItem => lineItem.product,
    { lazy: true }
  )
  lineItems: Lazy<LineItem[]>;

  @OneToMany(
    () => Price,
    price => price.product,
    { lazy: true }
  )
  prices: Lazy<Price[]>;
}
@Entity()
@Exclusion(`USING gist ("productId" WITH =, "dateRange" WITH &&)`)
export class Price {
  @PrimaryGeneratedColumn()
  id: number;
  @Column("int")
  value: number;
  @Column("daterange")
  dateRange: string;

  @ManyToOne(
    () => Product,
    product => product.prices,
    { lazy: true }
  )
  product: Lazy<Product>;
}

@ObjectType()
@Entity()
export class LineItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;
  @Field(() => Product)
  @ManyToOne(
    () => Product,
    product => product.lineItems,
    { lazy: true }
  )
  product: Lazy<Product>;
}

@ObjectType()
@Entity()
export class Store {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;
  @Field()
  @Column()
  name: string;
  @Field(() => Cart)
  @OneToMany(
    () => Cart,
    cart => cart.store,
    { lazy: true }
  )
  stores: Lazy<Cart[]>;
}

@ObjectType()
@Entity()
export class Cart {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Store)
  @ManyToOne(
    () => Store,
    store => store.stores,
    { lazy: true }
  )
  store: Lazy<Store>;
}
