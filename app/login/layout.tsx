export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="login-page-wrapper fixed inset-0 h-screen w-screen overflow-hidden" style={{ marginTop: 0, paddingTop: 0 }}>
      {children}
    </div>
  );
}

