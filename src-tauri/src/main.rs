// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod storage;
use tauri::Manager;
use tauri::SystemTray;
use tauri::SystemTrayEvent;
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

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_data, update_data,load_data, delete_data,show_reminder])
        .setup(move |app| {
            let app_handle = app.app_handle();  
            let _storage: Box<dyn DataStorage> = if use_database {
                println!("データベースストレージを使用します。");
                Box::new(DatabaseStorage)
            } else {
                println!("ファイルシステムストレージを使用します。");
                Box::new(FileSystemStorage::new(app_handle.clone()))
            };
            println!("アプリケーションのセットアップが完了しました。");
            app.manage(_storage);  // ここでstorageをアプリケーションの状態として管理
            Ok(())
        })
        .system_tray(SystemTray::new())
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn add_data(data: String, _storage: tauri::State<Box<dyn DataStorage>>) -> Result<(), String> {
    println!("データ保存中: {}", data);
    _storage.add_data(&data)    
}

#[tauri::command]
fn update_data(id:String,data: String, _storage: tauri::State<Box<dyn DataStorage>>) -> Result<(), String> {
    println!("データ保存中: {}", data);
    _storage.update_data(&id,&data)    
}

#[tauri::command]
fn load_data(_storage: tauri::State<Box<dyn DataStorage>>) -> Result<String, String> {
    println!("データ読み込み中");
    _storage.load_data()
}
#[tauri::command]
fn delete_data(id:String, _storage: tauri::State<Box<dyn DataStorage>>) -> Result<(), String> {
    println!("データ削除中: {}", id);
    _storage.delete_data(&id)    
}

#[tauri::command]
async fn show_reminder(app_handle: tauri::AppHandle, todo_text: String) {
    let window = app_handle.get_window("main").unwrap();
    window.show().unwrap();
    window.set_focus().unwrap();

    tauri::api::notification::Notification::new(app_handle.config().tauri.bundle.identifier.clone())
        .title("タスクリマインダー")
        .body(&format!("タスクの時間です: {}", todo_text))
        .show()
        .unwrap();
}