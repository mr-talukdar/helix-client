export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {children}
    </div>
  )
}
