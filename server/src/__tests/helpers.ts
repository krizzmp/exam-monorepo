import {
  createConnection,
  EntitySchema,
  getConnection,
  getRepository,
  ObjectType,
  QueryRunner
} from "typeorm";
import * as entities from "../entities";
import { Container } from "typedi";

const createHOD = <T, S>(setupFn: (_?: S) => T) => (
  testFn: (_: T) => any
) => () => {
  return testFn(setupFn());
};
export const withDb = createHOD(() => {
  beforeAll(async () => {
    await createConnection({
      type: "postgres",
      url: "postgresql://localhost:5432/exam_test",
      entities: Object.values(entities),
      logging: false,
      synchronize: true
    });
  });
  afterAll(async () => {
    await getConnection().close();
  });
});
export function getRepo<T>(f: ObjectType<T> | EntitySchema<T> | string) {
  if (Container.has("queryRunner")) {
    const queryRunner = Container.get<QueryRunner>("queryRunner");
    return queryRunner.manager.getRepository(f);
  }
  return getRepository(f);
}
export const withMigrations = createHOD(() => {
  beforeEach(async () => {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    Container.set("queryRunner", queryRunner);
  });
  afterEach(async () => {
    const queryRunner = Container.get<QueryRunner>("queryRunner");
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });
});
