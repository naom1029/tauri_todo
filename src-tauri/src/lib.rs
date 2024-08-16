// mod storage;
use dotenv::dotenv;
use std::env;
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();
    let use_database = match env::var("USE_DATABASE") {
        Ok(val) => val != "false",
        Err(_) => false,
    };
    println!("USE_DATABASEの設定値: {}", use_database);
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE todos (id TEXT PRIMARY KEY,
                text TEXT NOT NULL,createdAt TEXT NOT NULL,
                completedAt TEXT,
                reminderAt TEXT);",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:sqlite.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
