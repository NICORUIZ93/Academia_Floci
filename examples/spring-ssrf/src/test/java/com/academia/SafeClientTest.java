package com.academia;

import com.sun.net.httpserver.HttpServer;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.boot.http.client.FilteredHostException;
import org.springframework.boot.http.client.InetAddressFilter;
import static org.junit.jupiter.api.Assertions.*;

class SafeClientTest {
    @Test
    void blocksBeforeRequestAndControlReallyReachesServer() throws Exception {
        var received = new AtomicInteger();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            received.incrementAndGet();
            byte[] body = "local fixture".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            try (var stream = exchange.getResponseBody()) { stream.write(body); }
        });
        server.start();
        try {
            String url = "http://127.0.0.1:" + server.getAddress().getPort() + "/";
            assertThrows(FilteredHostException.class,
                () -> SafeClient.externalOnly().get().uri(url).retrieve().body(String.class));
            assertEquals(0, received.get());
            // Control positivo exclusivamente contra nuestro servidor efímero local.
            assertEquals("local fixture", SafeClient.create(InetAddressFilter.all())
                .get().uri(url).retrieve().body(String.class));
            assertEquals(1, received.get());
        } finally { server.stop(0); }
    }
    @Test
    void excludesInternalAndMetadataRangesWithoutConnecting() throws Exception {
        var filter = InetAddressFilter.externalAddresses();
        for (String address : new String[]{"127.0.0.1", "10.0.0.1", "169.254.169.254", "::1"}) {
            assertFalse(filter.matches(InetAddress.getByName(address)), address);
        }
    }
}
