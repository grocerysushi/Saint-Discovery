import BlogEditor from "@/components/blog/BlogEditor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BlogEditor id={id} />; }
