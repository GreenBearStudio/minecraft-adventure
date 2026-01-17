#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;

use std::{thread, time::Duration};
use std::net::TcpStream;

fn wait_for_server() {
    for _ in 0..50 {
        if TcpStream::connect("127.0.0.1:8080").is_ok() {
            println!("✅ Rust server is responding");
            return;
        }
        thread::sleep(Duration::from_millis(100));
    }
    println!("⚠️ Rust server did not start in time");
}

fn main() {
    // Start the Rust server in a background thread
    thread::spawn(|| {
        server::start_server();
    });

    // Wait until it's reachable
    wait_for_server();

    // Launch Tauri
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

