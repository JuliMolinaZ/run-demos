export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout especial para login - SIN Navigation component
  return <>{children}</>;
}
