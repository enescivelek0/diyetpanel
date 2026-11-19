import ClientDetail from "./client-detail";

export default async function DanisanDetay({ params }: PageProps<"/panel/danisanlar/[id]">) {
  const { id } = await params;
  return <ClientDetail id={Number(id)} />;
}
