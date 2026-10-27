import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

public final class EventServer {
    private static final Map<String, String> CONTENT_TYPES = Map.of(
        ".html", "text/html; charset=utf-8",
        ".css", "text/css; charset=utf-8",
        ".js", "text/javascript; charset=utf-8",
        ".json", "application/json; charset=utf-8",
        ".jpeg", "image/jpeg",
        ".jpg", "image/jpeg",
        ".png", "image/png",
        ".svg", "image/svg+xml"
    );

    private static final String EVENT_JSON = """
        {
          "name": "STATOR GATHERING",
          "year": 2026,
          "startDay": "07",
          "endDay": "08",
          "monthYear": "OKTOBER 2026",
          "dateLabel": "7–8 Oktober 2026",
          "duration": "2 hari 1 malam",
          "venue": "Villa Pangalengan",
          "location": "Bandung",
          "roomsAndGroupsUnlockAt": "2026-11-06",
          "unlockLabel": "6 Nov 2026"
        }
        """;

    private EventServer() {
    }

    public static void main(String[] args) throws IOException {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 8080;
        Path webRoot = Path.of(args.length > 1 ? args[1] : ".").toAbsolutePath().normalize();

        if (!Files.isDirectory(webRoot)) {
            throw new IllegalArgumentException("Direktori web tidak ditemukan: " + webRoot);
        }

        HttpServer server = HttpServer.create(
            new InetSocketAddress(InetAddress.getLoopbackAddress(), port),
            0
        );
        server.createContext("/api/event", EventServer::handleEvent);
        server.createContext("/", exchange -> handleStatic(exchange, webRoot));
        server.start();
        System.out.printf("Stator Gathering berjalan di http://localhost:%d%n", port);
    }

    private static void handleEvent(HttpExchange exchange) throws IOException {
        if (!"/api/event".equals(exchange.getRequestURI().getPath())) {
            send(exchange, 404, "text/plain; charset=utf-8", "Endpoint tidak ditemukan.");
            return;
        }

        if (!"GET".equals(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "GET");
            send(exchange, 405, "text/plain; charset=utf-8", "Metode tidak diizinkan.");
            return;
        }

        send(exchange, 200, "application/json; charset=utf-8", EVENT_JSON);
    }

    private static void handleStatic(HttpExchange exchange, Path webRoot) throws IOException {
        if (!"GET".equals(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", "GET");
            send(exchange, 405, "text/plain; charset=utf-8", "Metode tidak diizinkan.");
            return;
        }

        String requestPath = exchange.getRequestURI().getPath();
        if ("/".equals(requestPath)) {
            requestPath = "/index.html";
        }

        Path relativePath = Path.of(requestPath.substring(1).replace("/", java.io.File.separator));
        Path file = webRoot.resolve(relativePath).normalize();
        if (!file.startsWith(webRoot) || !Files.isRegularFile(file)) {
            send(exchange, 404, "text/plain; charset=utf-8", "Halaman tidak ditemukan.");
            return;
        }

        String filename = file.getFileName().toString();
        int extensionIndex = filename.lastIndexOf('.');
        String extension = extensionIndex < 0 ? "" : filename.substring(extensionIndex).toLowerCase();
        String contentType = CONTENT_TYPES.getOrDefault(extension, "application/octet-stream");
        byte[] body = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, body.length);
        try (var response = exchange.getResponseBody()) {
            response.write(body);
        }
    }

    private static void send(HttpExchange exchange, int status, String contentType, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        try (var response = exchange.getResponseBody()) {
            response.write(bytes);
        }
    }
}
