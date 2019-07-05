import { default as createService, Service } from 'feathers-memory';

const service1 = createService();
const service2 = new Service({
  startId: 10
});

service1._find({});

service2.store[1];
