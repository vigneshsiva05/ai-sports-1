import { indianSports } from '@/lib/sports';

export async function generateStaticParams() {
  return indianSports.map((sport) => ({
    sportId: sport.id,
  }));
}

export default function SportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}