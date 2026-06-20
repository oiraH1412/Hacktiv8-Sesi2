//Import library dotenv untuk membaca file .env
import 'dotenv/config';
//Import library express untuk membuat server HTTP
import express from 'express';
//Import library multer untuk menangani upload file (multipart/form-data)
import multer from 'multer';
//Import class GoogleGenAI dari library @google/genai untuk mengakses Gemini AI
import { GoogleGenAI } from '@google/genai';

//Membuat instance aplikasi Express
const app = express();
//Membuat instance Multer dengan konfigurasi default (menyimpan file di memory/buffer)
const upload = multer();
//Membuat instance GoogleGenAI dengan API key yang diambil dari environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//Menentukan model Gemini yang akan digunakan untuk semua endpoint
const GEMINI_MODEL = 'gemini-2.5-flash';

//Mengaktifkan middleware express.json() agar server bisa mem-parsing body request dalam format JSON
app.use(express.json());

//Menentukan port server dan menjalankan server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

/**
 * Endpoint POST /generate-text
 * Menerima prompt teks dari body request dan mengirimkannya ke model Gemini AI.
 * Mengembalikan hasil generate dalam format JSON.
 */
app.post('/generate-text', async (req, res) => {
    try {
        //Mengambil prompt dari body request, jika body kosong maka default ke object kosong
        const { prompt } = req.body || {};
        //Memanggil model Gemini AI dengan prompt yang diberikan
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });
        //Mengembalikan hasil generate ke client dalam format JSON
        res.status(200).json({ result: response.text });
    } catch (e) {
        //Menampilkan error di console dan mengembalikan HTTP 500 ke client
        console.log(e);
        res.status(500).json({ message: e.message});
    }
});

/**
 * Endpoint POST /generate-from-image
 * Menerima file gambar dan prompt (opsional) dari client.
 * Mengonversi gambar ke base64, menggabungkannya dengan prompt sebagai input multimodal,
 * lalu mengirimkannya ke model Gemini AI untuk mendapatkan deskripsi gambar.
 */
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    try {
        //Mengambil prompt opsional dari body request
        const { prompt } = req.body || {};
        //Mengonversi buffer file gambar ke format base64
        const imageBase64 = req.file.buffer.toString('base64');

        //Menyusun input multimodal: data gambar (base64) + prompt teks
        const contents = [
            {
                inlineData: {
                    //Tipe MIME gambar (contoh: image/png, image/jpeg)
                    mimeType: req.file.mimetype,
                    //Data gambar dalam format base64
                    data: imageBase64,
                },
            },
            //Prompt teks, jika tidak diberikan maka default 'Describe this image'
            { text: prompt || 'Describe this image' },
        ];

        //Memanggil model Gemini AI dengan input multimodal (gambar + teks)
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
        });

        //Mengembalikan hasil deskripsi gambar ke client
        res.status(200).json({ result: response.text });
    } catch (e) {
        //Menampilkan error di console dan mengembalikan HTTP 500 ke client
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

/**
 * Endpoint POST /generate-from-document
 * Menerima file dokumen (PDF, TXT, DOCX, dll) dan prompt (opsional) dari client.
 * Mengonversi dokumen ke base64, menggabungkannya dengan prompt sebagai input multimodal,
 * lalu mengirimkannya ke model Gemini AI untuk mendapatkan ringkasan atau analisis.
 */
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    try {
        //Mengambil prompt opsional dari body request
        const { prompt } = req.body || {};
        //Mengonversi buffer file dokumen ke format base64
        const documentBase64 = req.file.buffer.toString('base64');

        //Menyusun input multimodal: data dokumen (base64) + prompt teks
        const contents = [
            {
                inlineData: {
                    //Tipe MIME dokumen (contoh: application/pdf, text/plain)
                    mimeType: req.file.mimetype,
                    //Data dokumen dalam format base64
                    data: documentBase64,
                },
            },
            //Prompt teks, jika tidak diberikan maka default 'Summarize this document'
            { text: prompt || 'Summarize this document' },
        ];

        //Memanggil model Gemini AI dengan input multimodal (dokumen + teks)
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
        });

        //Mengembalikan hasil ringkasan/analisis dokumen ke client
        res.status(200).json({ result: response.text });
    } catch (e) {
        //Menampilkan error di console dan mengembalikan HTTP 500 ke client
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

/**
 * Endpoint POST /generate-from-audio
 * Menerima file audio (MP3, WAV, dll) dan prompt (opsional) dari client.
 * Mengonversi audio ke base64, menggabungkannya dengan prompt sebagai input multimodal,
 * lalu mengirimkannya ke model Gemini AI untuk mendapatkan transkripsi atau analisis.
 */
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    try {
        //Mengambil prompt opsional dari body request
        const { prompt } = req.body || {};
        //Mengonversi buffer file audio ke format base64
        const audioBase64 = req.file.buffer.toString('base64');

        //Menyusun input multimodal: data audio (base64) + prompt teks
        const contents = [
            {
                inlineData: {
                    //Tipe MIME audio (contoh: audio/mpeg, audio/wav)
                    mimeType: req.file.mimetype,
                    //Data audio dalam format base64
                    data: audioBase64,
                },
            },
            //Prompt teks, jika tidak diberikan maka default 'Transcribe this audio'
            { text: prompt || 'Transcribe this audio' },
        ];

        //Memanggil model Gemini AI dengan input multimodal (audio + teks)
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
        });

        //Mengembalikan hasil transkripsi/analisis audio ke client
        res.status(200).json({ result: response.text });
    } catch (e) {
        //Menampilkan error di console dan mengembalikan HTTP 500 ke client
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});
