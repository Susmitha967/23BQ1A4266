// logging_middleware/logger.js

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyM2JxMWE0MjY2QHZ2aXQubmV0IiwiZXhwIjoxNzgwNjM4MDA2LCJpYXQiOjE3ODA2MzcxMDYsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyY2JjMjUyZi1iZDU2LTRkZDMtYTc4Ny0zNDcwMmRjYmE0YjUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJqaWxsZWxsYSBzdXNtaXRoYSIsInN1YiI6ImEzODkzYzg2LWVlZjItNGNhYy04ZmQ2LTM1OTM5NDJmYjVhOCJ9LCJlbWFpbCI6IjIzYnExYTQyNjZAdnZpdC5uZXQiLCJuYW1lIjoiamlsbGVsbGEgc3VzbWl0aGEiLCJyb2xsTm8iOiIyM2JxMWE0MjY2IiwiYWNjZXNzQ29kZSI6IlFRZEVZeSIsImNsaWVudElEIjoiYTM4OTNjODYtZWVmMi00Y2FjLThmZDYtMzU5Mzk0MmZiNWE4IiwiY2xpZW50U2VjcmV0IjoiV0pTcmVEUkdIYUthYWVGZSJ9.ATHTGj_kYBNeqjim1CTUju0Ujfn0-TdWzlQlmC_OGpA";
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";



export async function customLog({ stack, level, packageName, message }) {
  try {
    const response = await fetch(LOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        stack,         // "frontend"
        level,         // "debug" | "info" | "warn" | "error" | "fatal"
        package: packageName, 
        message
      })
    });

    const data = await response.json();
    console.log("Server Sync Response:", data);
  } catch (error) {
    console.error("Log failed :", error);
  }
}