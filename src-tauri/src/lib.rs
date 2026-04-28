#[tauri::command]
fn resize_window(window: tauri::Window, width: f64, height: f64) -> Result<(), String> {
    use tauri::LogicalSize;
    let size = LogicalSize::new(width, height);
    window
        .set_size(size)
        .map_err(|e| e.to_string())?;
    window
        .center()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![resize_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
