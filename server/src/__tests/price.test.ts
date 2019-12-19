import { Price, Product } from "../entities";
import { getRepo, withDb, withMigrations } from "./helpers";

describe(
  "price",
  withDb(
    withMigrations(() => {
      it("should Price", async function() {
        const priceRepository = getRepo(Price);
        let product1 = priceRepository.create({
          dateRange: "[2010-01-01,2010-01-02)",
          value: 3000
        });
        await priceRepository.save(product1);
        let prices = await priceRepository.find();
        expect(prices).toContainEqual({
          dateRange: "[2010-01-01,2010-01-02)",
          id: product1.id,
          value: 3000
        });
      });
      it("overlapping prices for different products should not fail", async function() {
        const productRepository = getRepo(Product);
        const priceRepository = getRepo(Price);
        async function productFac(id: string) {
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
          let price = priceRepository.create({
            dateRange: dateRange,
            value: 30_00,
            product: product
          });
          return await priceRepository.save(price);
        }

        await priceFac(product, "[2010-01-01,2010-01-05)");
        let price = await priceFac(product2, "[2010-01-01,2010-01-02)");
        let prices = await priceRepository.find();

        expect(prices).toContainEqual({
          dateRange: "[2010-01-01,2010-01-02)",
          id: price.id,
          value: 3000
        });
      });
      it("overlapping prices for same products should fail", async function(done) {
        const productRepository = getRepo(Product);
        const priceRepository = getRepo(Price);

        async function productFac(id: string) {
          let product = productRepository.create({
            id,
            name: "grep",
            price: 30_00
          });
          await productRepository.save(product);
          return product;
        }
        async function priceFac(product: Product, dateRange: string) {
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
    })
  )
);
