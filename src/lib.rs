extern crate wasm_bindgen;

use std::io::Write;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ZipArchive {
    zip_writer: zip::ZipWriter<std::io::Cursor<Vec<u8>>>,
}

#[wasm_bindgen]
impl ZipArchive {
    #[wasm_bindgen]
    pub fn new() -> ZipArchive {
        ZipArchive {
            zip_writer: zip::ZipWriter::new(std::io::Cursor::new(Vec::new())),
        }
    }

    #[wasm_bindgen]
    pub fn add(&mut self, filename: &str, content: Vec<u8>) {
        let options =
            zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        self.zip_writer.start_file(filename, options).unwrap();
        self.zip_writer.write_all(&content[..]).unwrap();
    }

    #[wasm_bindgen]
    pub fn finish(&mut self) -> Vec<u8> {
        let cursor = self.zip_writer.finish().unwrap();
        let pos = cursor.position();
        let mut content = cursor.into_inner();
        content.truncate(pos.try_into().unwrap());
        content
    }
}
