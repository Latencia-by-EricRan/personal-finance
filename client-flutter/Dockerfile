# cirrusci/flutter (Docker Hub) is abandoned — last real tag is 1.1.0. Using the
# actively maintained cirruslabs image instead, multi-arch (amd64/arm64), tracks
# the current Flutter stable channel to match the local toolchain (3.44.4 / Dart 3.12.2).
FROM ghcr.io/cirruslabs/flutter:stable

WORKDIR /app

COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

COPY . .

EXPOSE 8080

CMD ["flutter", "run", "-d", "web-server", "--web-hostname=0.0.0.0", "--web-port=8080"]
