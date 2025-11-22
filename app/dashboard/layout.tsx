import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header showAuthButtons={true} />

      <div className="flex h-[calc(100vh-64px)]">
        <div className="hidden lg:block lg:w-64 lg:shrink-0 border-r bg-white">
          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <Sidebar />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1">
            <div className="py-8">
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