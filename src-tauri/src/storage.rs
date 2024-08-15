use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::path::Path;
use tauri::AppHandle;

pub trait DataStorage: Send + Sync {
    fn save_data(&self, data: &str) -> Result<(), String>;
    fn load_data(&self) -> Result<String, String>;
}

pub struct FileSystemStorage {
    app_handle: AppHandle,
}

impl FileSystemStorage {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    // ヘルパーメソッド: ファイルパスの存在をチェックし、必要に応じてディレクトリを作成
    fn ensure_directory_exists(path: &str) -> Result<(), String> {
        let path = Path::new(path).parent().ok_or_else(|| "無効なファイルパスです。".to_string())?;
        if !path.exists() {
            std::fs::create_dir_all(path).map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?
        }
        Ok(())
    }

    fn get_data_path(&self) -> Result<String, String> {
        if cfg!(debug_assertions) {
            Ok("../data/data.json".to_string())
        } else {
            let app_dir = self.app_handle.path_resolver().app_data_dir().ok_or_else(|| "アプリケーションデータディレクトリの取得に失敗しました".to_string())?;
            let data_path = app_dir.join("data.json");
            Ok(data_path.to_string_lossy().to_string())
        }
    }
}

impl DataStorage for FileSystemStorage {
    fn save_data(&self, data: &str) -> Result<(), String> {
        let path = self.get_data_path()?;
        Self::ensure_directory_exists(&path)?;
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(&path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;
        file.write_all(data.as_bytes())
            .map_err(|e| format!("データの書き込みに失敗しました: {}", e))
    }

    fn load_data(&self) -> Result<String, String> {
        let path = self.get_data_path()?;
        let mut file = OpenOptions::new()
            .read(true)
            .open(&path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;
        let mut data = String::new();
        file.read_to_string(&mut data)
            .map_err(|e| format!("データの読み込みに失敗しました: {}", e))?;
        Ok(data)
    }
}

pub struct DatabaseStorage;
impl DataStorage for DatabaseStorage {
    fn save_data(&self, _data: &str) -> Result<(), String> {
        Ok(())
    }

    fn load_data(&self) -> Result<String, String> {
        Ok("データベースから読み込んだデータ".to_string())

    }
}