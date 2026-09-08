// Re-monté à chaque navigation → fondu d'entrée court entre les pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
