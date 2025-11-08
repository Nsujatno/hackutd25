export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0f0f0f]">
      {children}
    </div>
  );
}