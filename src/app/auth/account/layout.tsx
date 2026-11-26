export default function AccountLayout({ children }: { children: React.ReactNode }) {
  // Skip the auth layout (centered white card) — full page layout
  return <>{children}</>;
}
