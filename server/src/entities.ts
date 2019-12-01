import { Field, ObjectType } from "type-graphql";
import {
  Column,
  Entity,
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
