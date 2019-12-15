import {
  closeTestConnection,
  createTestConnection
} from "./factories/testConnectionFactory";

function create_it(it: any) {
  return (name: string, fn: any) => {
    it(name, async () => {
      await createTestConnection();
      await fn();
      await closeTestConnection();
    });
  };
}

export let db_it = (name: string, fn: any) => {
  it(name, async () => {
    await createTestConnection();
    await fn();
    await closeTestConnection();
  });
};
export let db_done_it = (name: string, fn: (done: () => void) => any) => {
  it(name, async () => {
    await createTestConnection();
    await new Promise(done => fn(done));
    await closeTestConnection();
  });
};
