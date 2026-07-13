import { ExampleItemRepository } from './contexts/_example/application/ports/ExampleItemRepository';
import { MongooseExampleItemRepository } from './contexts/_example/infrastructure/MongooseExampleItemRepository';

export interface AppContainer {
    exampleItemRepository: ExampleItemRepository;
}

export interface CompositionOptions {
    exampleItemRepository?: ExampleItemRepository;
}

export const createCompositionRoot = (options: CompositionOptions = {}): AppContainer => ({
    exampleItemRepository: options.exampleItemRepository ?? new MongooseExampleItemRepository(),
});
