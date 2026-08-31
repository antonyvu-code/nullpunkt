import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const BASE = "https://nullpunkt.vercel.app";

/* Thêm 31.08.2026 cùng `robots.ts`.
 *
 * SINH TỪ `projects`, KHÔNG GÕ TAY. Cùng nguồn mà `/work/[slug]` dùng để
 * `generateStaticParams`, nên một case mới thêm vào `lib/projects.ts` là tự có
 * mặt ở đây. Danh sách gõ tay sẽ lệch âm thầm — đúng loại nợ mà ZIELE §7 ghi
 * cho ảnh preview: "20 trang = 20 chỗ có thể lệch âm thầm", và không build nào
 * báo lỗi.
 *
 * IMPRESSUM VÀ DATENSCHUTZ CỐ Ý KHÔNG CÓ Ở ĐÂY. Cả hai mang
 * `robots: { index: false }`; đưa vào sitemap là mời crawler index đúng thứ vừa
 * bảo nó đừng index. Sitemap và thẻ meta phải nói cùng một câu.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${BASE}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
