import { Providers } from "@/components/providers";

export default function DemoViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Providers>
        {children}
      </Providers>
    </div>
  );
}
