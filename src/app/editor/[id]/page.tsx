import WebsiteEditorLayout from "@/widgets/website-editor-layout";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WebsiteEditorLayout websiteId={id} />;
}
