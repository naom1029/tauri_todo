// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod storage;
use tauri::Manager;
use dotenv::dotenv;
use std::env;
use storage::{DataStorage, FileSystemStorage, DatabaseStorage};

fn main() {
    dotenv().ok();
    let use_database = match env::var("USE_DATABASE") {
        Ok(val) => val != "false",
        Err(_) => false,
    };
    println!("USE_DATABASEの設定値: {}", use_database);

    let _storage: Box<dyn DataStorage> = if use_database {
        println!("データベースストレージを使用します。");
        Box::new(DatabaseStorage)
    } else {
        println!("ファイルシステムストレージを使用します。");
        Box::new(FileSystemStorage)
    };

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_data, load_data])
        .setup(move |app| {
            let _app_handle = app.app_handle();
            println!("アプリケーションのセットアップが完了しました。");
            app.manage(_storage);  // ここでstorageをアプリケーションの状態として管理
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn save_data(data: String, _storage: tauri::State<Box<dyn DataStorage>>) -> Result<(), String> {
    println!("データ保存中: {}", data);
    _storage.save_data(&data)    
}

#[tauri::command]
fn load_data(_storage: tauri::State<Box<dyn DataStorage>>) -> Result<String, String> {
    _storage.load_data()
}
