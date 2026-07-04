import 'dart:async';

import 'package:dio/dio.dart';

import '../auth/token_storage.dart';
import '../config/api_config.dart';

class DioClient {
  DioClient({
    required AuthTokenStore tokenStore,
    FutureOr<void> Function()? onUnauthorized,
    Dio? dio,
  }) : dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: ApiConfig.baseUrl,
                // Bound every request so an unresponsive host fails loudly
                // instead of hanging forever.
                connectTimeout: const Duration(seconds: 10),
                sendTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 15),
              ),
            ) {
    this.dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) async {
              final token = await tokenStore.readToken();
              if (token != null) {
                options.headers['Authorization'] = 'Bearer $token';
              }
              handler.next(options);
            },
            onError: (error, handler) async {
              if (error.response?.statusCode == 401) {
                await tokenStore.clearToken();
                await onUnauthorized?.call();
              }
              handler.next(error);
            },
          ),
        );
  }

  final Dio dio;
}
