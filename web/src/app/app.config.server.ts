import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { API_BASE_URL } from './core/tokens/api-base-url.token';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: API_BASE_URL, useValue: process.env['API_URL_SERVER'] ?? 'http://localhost:3000' }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
