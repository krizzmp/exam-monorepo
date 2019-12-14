import { apolloServer } from "./createApolloServer";
import { gql } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";
import { createConnection, getConnection, getRepository } from "typeorm";
import { LineItem, Price, Product } from "./entities";
function ProductFactory(
  product: Partial<Product> = {
    id: "1234567890123",
    name: "testy lemon",
    price: 20_00
  }
) {
  let repository = getRepository(Product);
  let product1 = repository.create(product);
  return repository.save(product1);
}
async function LineItemFactory(id = "1") {
  const product = {
    id: id,
    product: await ProductFactory()
  };
  let repository = getRepository(LineItem);
  let product1 = repository.create(product);
  return repository.save(product1);
}
function createTestConnection() {
  return createConnection({
    type: "postgres",
    url: "postgresql://localhost:5432/exam_test",
    dropSchema: true,
    entities: [LineItem, Product, Price],
    synchronize: true,
    logging: false
  });
}
describe("product", function() {
  beforeEach(createTestConnection);
  afterEach(() => {
    let conn = getConnection();
    return conn.close();
  });
  it("should create product", async function() {
    const { mutate } = createTestClient(await apolloServer);
    const response = await mutate({
      mutation: gql`
        mutation($id: String!, $name: String!, $price: Int!) {
          createProduct(id: $id, name: $name, price: $price) {
            id
          }
        }
      `,
      variables: { id: "1234", name: "test", price: 300_00 }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.createProduct.id).toBe("1234");
  });
  it("should query Products", async function() {
    await ProductFactory();
    const { query } = createTestClient(await apolloServer);
    const response = await query({
      query: gql`
        query {
          products {
            id
            name
            price
          }
        }
      `
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.products).toContainEqual({
      id: "1234567890123",
      name: "testy lemon",
      price: 20_00
    });
  });
});
describe("lineItem", function() {
  beforeEach(createTestConnection);
  afterEach(() => {
    let conn = getConnection();
    return conn.close();
  });
  it("should scan LineItem", async function() {
    await ProductFactory();
    const { mutate } = createTestClient(await apolloServer);
    const response = await mutate({
      mutation: gql`
        mutation s1($productId: String!) {
          s1: scanLineItem(productId: $productId) {
            id
          }
          s2: scanLineItem(productId: $productId) {
            id
          }
        }
      `,
      variables: { productId: "1234567890123", productId2: "1234567890123" }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.s1.id).toBe("1");
    expect(response.data.s2.id).toBe("2");
  });
  it("should query LineItems", async function() {
    await LineItemFactory("1");
    await LineItemFactory("2");
    const { query } = createTestClient(await apolloServer);
    const response = await query({
      query: gql`
        query {
          lineItems {
            id
          }
        }
      `
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.lineItems).toContainEqual({ id: "1" });
    expect(response.data.lineItems).toContainEqual({ id: "2" });
    expect(response.data.lineItems).toHaveLength(2);
  });
  it("should query LineItem", async function() {
    await LineItemFactory("1");
    const { query } = createTestClient(await apolloServer);
    const response = await query({
      query: gql`
        query($id: String!) {
          lineItem(id: $id) {
            id
            product {
              name
            }
          }
        }
      `,
      variables: { id: "1" }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.lineItem).toEqual({
      id: "1",
      product: { name: "testy lemon" }
    });
  });
});
describe("price", function() {
  beforeEach(createTestConnection);
  afterEach(() => {
    let conn = getConnection();
    return conn.close();
  });
  it("should Price", async function() {
    let repository = getRepository(Price);
    let product1 = repository.create({
      dateRange: "[2010-01-01,2010-01-02)",
      value: 3000
    });
    await repository.save(product1);
    let prices = await repository.find();
    expect(prices).toContainEqual({
      dateRange: "[2010-01-01,2010-01-02)",
      id: product1.id,
      value: 3000
    });
  });
  it("overlapping prices for different products should not fail", async function() {
    async function productFac(id: string) {
      let productRepository = getRepository(Product);
      let product = productRepository.create({
        id,
        name: "grep",
        price: 30_00
      });
      await productRepository.save(product);
      return product;
    }

    let product = await productFac("1234");
    let product2 = await productFac("12345");

    async function priceFac(product: Product, dateRange: string) {
      let priceRepository = getRepository(Price);
      let price = priceRepository.create({
        dateRange: dateRange,
        value: 30_00,
        product: product
      });
      return await priceRepository.save(price);
    }

    await priceFac(product, "[2010-01-01,2010-01-05)");
    let price = await priceFac(product2, "[2010-01-01,2010-01-02)");
    let priceRepository = getRepository(Price);
    let prices = await priceRepository.find();

    expect(prices).toContainEqual({
      dateRange: "[2010-01-01,2010-01-02)",
      id: price.id,
      value: 3000
    });
  });
  it("overlapping prices for same products should fail", async function(done) {
    async function productFac(id: string) {
      let productRepository = getRepository(Product);
      let product = productRepository.create({
        id,
        name: "grep",
        price: 30_00
      });
      await productRepository.save(product);
      return product;
    }
    async function priceFac(product: Product, dateRange: string) {
      let priceRepository = getRepository(Price);
      let price = priceRepository.create({
        dateRange: dateRange,
        value: 30_00,
        product: product
      });
      return await priceRepository.save(price);
    }
    try {
      let product = await productFac("1234");
      await priceFac(product, "[2010-01-01,2010-01-05)");
      await priceFac(product, "[2010-01-01,2010-01-02)");
    } catch (e) {
      expect(e.code).toEqual("23P01");
      done();
    }
  });
});
