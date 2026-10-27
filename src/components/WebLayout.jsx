import SidebarNav from './SidebarNav'

const WebLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-canvas">
      <SidebarNav />
      <main className="ml-64 min-h-screen min-w-0 desktop-content">
        {children}
      </main>
    </div>
  )
}

export default WebLayout
