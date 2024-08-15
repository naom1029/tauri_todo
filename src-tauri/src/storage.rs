use std::fs::{OpenOptions, File};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use tauri::AppHandle;
use serde_json::Value;


pub trait DataStorage: Send + Sync {
    fn add_data(&self, data: &str) -> Result<(), String>;
    fn update_data(&self,id:&str, data: &str) -> Result<(), String>;
    fn load_data(&self) -> Result<String, String>;
    fn delete_data(&self, id: &str) -> Result<(), String>;
}

pub struct FileSystemStorage {
    app_handle: AppHandle,
}

impl FileSystemStorage {
    pub fn new(app_handle: AppHandle) -> Self {
        let storage = Self { app_handle };

        // ファイルの存在を確認し、存在しない場合は新規作成
        if let Ok(path) = storage.get_data_path() {
            if !Path::new(&path).exists() {
                if let Err(e) = File::create(&path) {
                    eprintln!("データファイルの作成に失敗しました: {}", e);
                }
            }
        } else {
            eprintln!("データパスの取得に失敗しました。");
        }

        storage
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
            Ok("../data/data.jsonl".to_string())
        } else {
            let app_dir = self.app_handle.path_resolver().app_data_dir().ok_or_else(|| "アプリケーションデータディレクトリの取得に失敗しました".to_string())?;
            let data_path = app_dir.join("data.jsonl");
            Ok(data_path.to_string_lossy().to_string())
        }
    }
}

impl DataStorage for FileSystemStorage {
    // JSONLファイルにデータを追加保存する関数
    fn add_data(&self, data: &str) -> Result<(), String> {
        let path = self.get_data_path()?;
        Self::ensure_directory_exists(&path)?;

        // 追加書き込みモードでファイルを開く
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .append(true)
            .open(&path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;

        file.write_all(data.as_bytes())
            .and_then(|_| file.write_all(b"\n")) // 各エントリを改行で区切る
            .map_err(|e| format!("データの書き込みに失敗しました: {}", e))
    }

    // JSONLファイルから指定されたIDのデータを更新する関数
    fn update_data(&self, id: &str, data: &str) -> Result<(), String> {
        let path = self.get_data_path()?;
        let file = OpenOptions::new()
            .read(true)
            .open(&path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;

        let reader = BufReader::new(&file);
        let mut lines = Vec::new();
        let mut found = false;

        for line in reader.lines() {
            let line = line.map_err(|e| format!("行の読み込みに失敗しました: {}", e))?;
            let mut todo: Value = serde_json::from_str(&line)
                .map_err(|e| format!("JSONの解析に失敗しました: {}", e))?;
            
            if todo["id"] == id {
                let updated_data: Value = serde_json::from_str(data)
                    .map_err(|e| format!("更新データの解析に失敗しました: {}", e))?;
                
                    if let Some(todo_object) = todo.as_object_mut() {
                        for (key, value) in updated_data.as_object().unwrap() {
                            // nullの場合は削除、そうでない場合は更新
                            if value.is_null() {
                                todo_object.remove(key);
                            } else {
                                todo_object.insert(key.clone(), value.clone());
                            }
                        }
                    }
                found = true;
            }
            lines.push(serde_json::to_string(&todo).map_err(|e| format!("JSONのシリアル化に失敗しました: {}", e))?);
        }

        if !found {
            return Err(format!("ID '{}' に一致するデータが見つかりませんでした", id));
        }

        // ファイルをクリアして新しいデータで上書き
        let mut file = File::create(&path).map_err(|e| format!("ファイルの作成に失敗しました: {}", e))?;
        for line in lines {
            file.write_all(line.as_bytes()).map_err(|e| format!("データの書き込みに失敗しました: {}", e))?;
            file.write_all(b"\n").map_err(|e| format!("データの書き込みに失敗しました: {}", e))?;
        }

        println!("データが正常に保存されました"); // デバッグ出力
        Ok(())
    }

    // JSONLファイルからすべてのデータを読み込む関数
    fn load_data(&self) -> Result<String, String> {
        let path = self.get_data_path()?;
        let file = OpenOptions::new()
            .read(true)
            .open(&path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;

        let reader = BufReader::new(file);
        let mut todos = Vec::new();

        for line in reader.lines() {
            let line = line.map_err(|e| format!("行の読み込みに失敗しました: {}", e))?;
            let todo: Value = serde_json::from_str(&line)
                .map_err(|e| format!("JSONの解析に失敗しました: {}", e))?;
            todos.push(todo);
        }

        serde_json::to_string(&todos).map_err(|e| format!("JSONの変換に失敗しました: {}", e))
    }

    // JSONLファイルから指定されたIDのデータを削除する関数
    fn delete_data(&self, id: &str) -> Result<(), String> {
        let path = self.get_data_path()?;
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(&path)
            .map_err(|e| format!("ファイルのオープンに失敗しました: {}", e))?;

        let reader = BufReader::new(&file);
        let mut lines = Vec::new();

        for line in reader.lines() {
            let line = line.map_err(|e| format!("行の読み込みに失敗しました: {}", e))?;
            let todo: Value = serde_json::from_str(&line)
                .map_err(|e| format!("JSONの解析に失敗しました: {}", e))?;
            
            if todo["id"] != id {
                lines.push(line);
            }
        }

        // ファイルをクリアして新しいデータで上書き
        let mut file = File::create(&path).map_err(|e| format!("ファイルの作成に失敗しました: {}", e))?;
        for line in lines {
            file.write_all(line.as_bytes()).map_err(|e| format!("データの書き込みに失敗しました: {}", e))?;
            file.write_all(b"\n").map_err(|e| format!("データの書き込みに失敗しました: {}", e))?;
        }

        Ok(())
    }
}


pub struct DatabaseStorage;
impl DataStorage for DatabaseStorage {
    fn add_data(&self, _data: &str) -> Result<(), String> {
        Ok(())
    }
    fn update_data(&self,id:&str, data: &str) -> Result<(), String>{
        unimplemented!();
    }

    fn load_data(&self) -> Result<String, String> {
        Ok("データベースから読み込んだデータ".to_string())

    }
    fn delete_data(&self, _id: &str) -> Result<(), String>{
        unimplemented!()
    }

}