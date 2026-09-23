import type { Metadata } from "next";
import BlogAuth from "@/components/blog/BlogAuth";
import AnalyticsTrafficControls from "@/components/AnalyticsTrafficControls";
import "../../blog/blog.css";
export const metadata: Metadata = { title: "Writing Studio", robots: { index: false, follow: false }, alternates: { canonical: null } };
export default function AdminBlogLayout({ children }: { children: React.ReactNode }) { return <><BlogAuth>{children}</BlogAuth><AnalyticsTrafficControls /></>; }
