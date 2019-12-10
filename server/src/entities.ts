import { Field, ObjectType } from "type-graphql";
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
  id: string;
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
  @Field()
  @PrimaryGeneratedColumn()
  id: string;
  @Field(() => Product)
  @ManyToOne(
    () => Product,
    product => product.lineItems,
    { lazy: true }
  )
  product: Lazy<Product>;
}
