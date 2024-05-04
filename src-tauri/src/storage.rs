use std::fs::{self,OpenOptions};
use std::io::{Read, Write};
use std::path::Path;
pub trait DataStorage: Send + Sync {
    fn save_data(&self, data: &str) -> Result<(), String>;
    fn load_data(&self) -> Result<String, String>;
}

pub struct FileSystemStorage;
impl FileSystemStorage {
    // ヘルパーメソッド: ファイルパスの存在をチェックし、必要に応じてディレクトリを作成
    fn ensure_directory_exists(path: &str) -> Result<(), String> {
        let path = Path::new(path).parent().ok_or_else(|| "無効なファイルパスです。".to_string())?;
        if !path.exists() {
            std::fs::create_dir_all(path).map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?
        }
        Ok(())
    }
}
impl DataStorage for FileSystemStorage {
    // ファイルシステムに関するメソッドの実装

    
    fn save_data(&self, data: &str) -> Result<(), String> {
        let path = "../data/data.json";

        // ディレクトリ確認と作成
        Self::ensure_directory_exists(path)?;

        // ファイルオープン
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;

        // データの書き込み
        file.write_all(data.as_bytes())
            .map_err(|e| format!("データの書き込みに失敗しました: {}", e))
    }

    
    fn load_data(&self) -> Result<String, String> {
        let path = "../data/data.json";
        
        let mut file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(path)
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
