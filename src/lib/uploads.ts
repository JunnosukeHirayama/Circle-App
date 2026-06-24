import path from "node:path";

// アップロード画像の保存ディレクトリ。
// 本番（Render等の永続ディスク）では UPLOAD_DIR=/data/uploads を設定する。
// 未設定時はプロジェクト直下の uploads/（ローカル開発用）。
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

// 画像を配信するURLの接頭辞（GET /api/uploads/...）。
export const UPLOAD_URL_PREFIX = "/api/uploads";

export const ALLOWED_IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
