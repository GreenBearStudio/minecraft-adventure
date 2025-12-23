package com.amunishk.hunjvo;

import android.os.Bundle;
import android.webkit.WebView;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

import android.net.Uri;
import android.net.http.HttpResponseCache;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {

    private boolean serverRunning = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        startLocalServer();

        WebView webView = this.bridge.getWebView();
        webView.loadUrl("http://127.0.0.1:8080/index.html");
    }

    private void startLocalServer() {
        if (serverRunning) return;

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                ServerSocket serverSocket = new ServerSocket(8080);
                serverRunning = true;
                Log.d("LocalServer", "Server started on port 8080");

                while (true) {
                    Socket socket = serverSocket.accept();
                    handleClient(socket);
                }

            } catch (Exception e) {
                Log.e("LocalServer", "Server error", e);
            }
        });
    }

    private void handleClient(Socket socket) {
    Executors.newSingleThreadExecutor().execute(() -> {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            OutputStream out = socket.getOutputStream();

            String line = in.readLine();
            if (line == null) return;

            String[] parts = line.split(" ");
            if (parts.length < 2) return;

            String path = parts[1];
            Log.d("LocalServer", "Request: " + path);

            // Default file
            if (path.equals("/")) path = "/index.html";

            // Remove leading slash
            if (path.startsWith("/")) path = path.substring(1);

            // Check if path is a directory
            try {
                String assetPath = "public/" + path;
                String[] list = getAssets().list(assetPath);

                if (list != null && list.length > 0) {
                    // It's a directory → serve index.html
                    path = path + "/index.html";
                }
            } catch (Exception ignored) {}

            String assetPath = "public/" + path;

            try {
                InputStream file = getAssets().open(assetPath);

                String mime = guessMimeType(path);

                out.write(("HTTP/1.1 200 OK\r\n" +
                        "Content-Type: " + mime + "\r\n" +
                        "Connection: close\r\n\r\n").getBytes());

                byte[] buffer = new byte[4096];
                int read;
                while ((read = file.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                file.close();

            } catch (IOException e) {
                out.write(("HTTP/1.1 404 Not Found\r\n" +
                        "Content-Type: text/plain\r\n" +
                        "Connection: close\r\n\r\n" +
                        "404 Not Found").getBytes());
            }

            out.flush();
            socket.close();

        } catch (Exception e) {
            Log.e("LocalServer", "Client error", e);
        }
    });
  } 
  
  private String guessMimeType(String path) {
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
    if (path.endsWith(".svg")) return "image/svg+xml";
    return "text/plain";
  }


}

