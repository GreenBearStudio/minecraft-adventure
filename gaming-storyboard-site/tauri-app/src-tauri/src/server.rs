use std::{
    fs,
    io::{Read, Write},
    net::{TcpListener, TcpStream},
    path::{Path, PathBuf},
};

pub fn start_server() {
    println!("Android‑style Rust server starting on 127.0.0.1:8080...");

    let listener = TcpListener::bind("127.0.0.1:8080")
        .expect("❌ Failed to bind to port 8080");

    println!("Server running at http://127.0.0.1:8080");

    for stream in listener.incoming() {
        match stream {
            Ok(mut stream) => {
                std::thread::spawn(move || {
                    handle_client(&mut stream);
                });
            }
            Err(e) => println!("❌ Error accepting connection: {}", e),
        }
    }
}

fn handle_client(stream: &mut TcpStream) {
    let mut buffer = [0; 4096];

    let bytes_read = match stream.read(&mut buffer) {
        Ok(n) => n,
        Err(e) => {
            println!("❌ Failed to read request: {}", e);
            return;
        }
    };

    if bytes_read == 0 {
        return;
    }

    let request = String::from_utf8_lossy(&buffer[..bytes_read]);
    let mut lines = request.lines();

    let first_line = match lines.next() {
        Some(l) => l,
        None => return,
    };

    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 {
        return;
    }

    let mut path = parts[1].to_string();
    println!("Request: {}", path);

    // Default file
    if path == "/" {
        path = "/index.html".into();
    }

    // Remove leading slash
    if path.starts_with('/') {
        path = path[1..].into();
    }

    // Android server uses "public/" prefix
    let mut asset_path = PathBuf::from("../../out");
    asset_path.push(&path);

    // Directory → serve index.html
    if asset_path.is_dir() {
        let index = asset_path.join("index.html");
        if index.exists() {
            println!("Directory detected → serving {}", index.display());
            asset_path = index;
        }
    }

    // Try to read file
    match fs::read(&asset_path) {
        Ok(contents) => {
            let mime = guess_mime_type(&asset_path);

            let header = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nConnection: close\r\n\r\n",
                mime
            );

            let _ = stream.write_all(header.as_bytes());
            let _ = stream.write_all(&contents);
        }
        Err(_) => {
            println!("❌ File NOT FOUND: {}", asset_path.display());
            let body = b"404 Not Found";
            let header = format!(
                "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\n"
            );
            let _ = stream.write_all(header.as_bytes());
            let _ = stream.write_all(body);
        }
    }
}

fn guess_mime_type(path: &Path) -> &'static str {
    let s = path.to_string_lossy();

    if s.ends_with(".html") { "text/html" }
    else if s.ends_with(".js") { "application/javascript" }
    else if s.ends_with(".css") { "text/css" }
    else if s.ends_with(".json") { "application/json" }
    else if s.ends_with(".png") { "image/png" }
    else if s.ends_with(".jpg") || s.ends_with(".jpeg") { "image/jpeg" }
    else if s.ends_with(".svg") { "image/svg+xml" }
    else { "text/plain" }
}

