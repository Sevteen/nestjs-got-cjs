import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { ExtendOptions } from 'got-cjs-compat';

export type GotModuleOptions = ExtendOptions;

export interface GotModuleOptionsFactory {
  createGotOptions(): Promise<GotModuleOptions> | GotModuleOptions;
}

export interface GotModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GotModuleOptionsFactory>;
  useClass?: Type<GotModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<GotModuleOptions> | GotModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
