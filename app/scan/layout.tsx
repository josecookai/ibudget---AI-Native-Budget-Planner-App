export default function ScanLayout({ children }: { children: React.ReactNode }) {
  // Keep the scanner in the original light, utility-first visual language,
  // even if the marketing landing page uses a dark theme.
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">{children}</div>
  );
}

