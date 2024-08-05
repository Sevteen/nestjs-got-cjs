import { Test, TestingModule } from '@nestjs/testing';
import { GOT_INSTANCE_TOKEN, GOT_MODULE_ID, GOT_OPTIONS_TOKEN } from '../../src/got/got.constant';
import { GotModuleOptions, GotModuleOptionsFactory } from '../../src/got/got.interface';
import { GotModule } from '../../src/got/got.module';
import { GotService } from '../../src/got/got.service';

class RealGotOptionsFactory implements GotModuleOptionsFactory {
  createGotOptions(): GotModuleOptions {
    return { timeout: { send: 1000 } };
  }
}
describe('GotModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GotModule.register({})],
    }).compile();
  });

  it('should provide GotService', () => {
    const gotService = module.get<GotService>(GotService);
    expect(gotService).toBeDefined();
  });

  it('should provide GOT_INSTANCE_TOKEN with got instance', () => {
    const gotInstance = module.get(GOT_INSTANCE_TOKEN);

    expect(gotInstance).toBeDefined();
    expect(gotInstance).toBeFunction();
  });

  it('should provide GOT_MODULE_ID', () => {
    const moduleId = module.get(GOT_MODULE_ID);
    expect(moduleId).toBeDefined();
  });

  describe('registerAsync', () => {
    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          GotModule.registerAsync({
            useClass: RealGotOptionsFactory,
            extraProviders: [],
          }),
        ],
      }).compile();
    });

    it('should provide GOT_INSTANCE_TOKEN with extended got instance', () => {
      const gotInstance = module.get(GOT_INSTANCE_TOKEN);
      expect(gotInstance).toBeDefined();
    });

    it('should provide GOT_OPTIONS_TOKEN from factory', () => {
      const options = module.get(GOT_OPTIONS_TOKEN);
      expect(options).toBeDefined();
      expect(options.timeout.send).toBe(1000);
    });

    it('should provide GOT_MODULE_ID', () => {
      const moduleId = module.get(GOT_MODULE_ID);
      expect(moduleId).toBeDefined();
    });
  });

  describe('registerAsync with useFactory', () => {
    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          GotModule.registerAsync({
            useFactory: () => ({
              timeout: { send: 1000 },
            }),
          }),
        ],
      }).compile();
    });

    it('should provide GOT_INSTANCE_TOKEN with extended got instance', () => {
      const gotInstance = module.get(GOT_INSTANCE_TOKEN);
      expect(gotInstance).toBeDefined();
    });

    it('should provide GOT_OPTIONS_TOKEN from factory', () => {
      const options = module.get(GOT_OPTIONS_TOKEN);
      expect(options).toBeDefined();
      expect(options.timeout.send).toBe(1000);
    });

    it('should provide GOT_MODULE_ID', () => {
      const moduleId = module.get(GOT_MODULE_ID);
      expect(moduleId).toBeDefined();
    });
  });
});
