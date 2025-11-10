import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header showAuthButtons={true} />
      
      <div className="flex">
        <div className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <Sidebar />
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col lg:pl-2">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}