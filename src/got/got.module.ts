import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { GotService } from './got.service';
import { GOT_INSTANCE_TOKEN, GOT_MODULE_ID, GOT_OPTIONS_TOKEN } from './got.constant';
import got from 'got-cjs';
import { StreamRequest } from '../stream/stream-request.service';
import { StreamService } from '../stream/stream.service';
import { PaginationService } from '../paginate/paginate.service';
import { GotModuleAsyncOptions, GotModuleOptions, GotModuleOptionsFactory } from './got.interface';

@Module({
  providers: [
    GotService,
    StreamRequest,
    StreamService,
    PaginationService,
    {
      provide: GOT_INSTANCE_TOKEN,
      useValue: got,
    },
  ],
  exports: [GotService],
})
export class GotModule {
  static register(config: GotModuleOptions): DynamicModule {
    return {
      module: GotModule,
      providers: [
        {
          provide: GOT_INSTANCE_TOKEN,
          useValue: got.extend(config),
        },
        {
          provide: GOT_MODULE_ID,
          useValue: randomStringGenerator(),
        },
      ],
    };
  }

  static registerAsync(options: GotModuleAsyncOptions): DynamicModule {
    return {
      module: GotModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: GOT_INSTANCE_TOKEN,
          useFactory: (config: GotModuleOptions) => got.extend(config),
          inject: [GOT_OPTIONS_TOKEN],
        },
        {
          provide: GOT_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(options: GotModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as Type<GotModuleOptionsFactory>,
        useClass: options.useClass as Type<GotModuleOptionsFactory>,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: GotModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: GOT_OPTIONS_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: GOT_OPTIONS_TOKEN,
      useFactory: async (optionsFactory: GotModuleOptionsFactory) => optionsFactory.createGotOptions(),
      inject: [(options.useExisting || options.useClass) as Type<GotModuleOptionsFactory>],
    };
  }
}
