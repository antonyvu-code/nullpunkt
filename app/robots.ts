import type { MetadataRoute } from "next";

/* Thêm 31.08.2026 — bản quét live cùng ngày cho thấy nullpunkt không có
   robots.txt lẫn sitemap.xml, giống 19/20 trang còn lại (chỉ `mono` có cả hai).
   Với 32 route prerender thì đó không còn là thiếu sót trang trí.

   KHÔNG chặn gì. Impressum và Datenschutz đã mang `robots: { index: false }`
   trong metadata của chính chúng — chặn thêm ở đây sẽ là chặn HAI LẦN bằng hai
   cơ chế, và crawler bị `Disallow` thì không đọc được thẻ meta để thấy `noindex`.
   Chặn đường đi lại làm chỉ thị không tới nơi: để crawler vào, đọc, rồi tự
   không index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://nullpunkt.vercel.app/sitemap.xml",
    host: "https://nullpunkt.vercel.app",
  };
}
