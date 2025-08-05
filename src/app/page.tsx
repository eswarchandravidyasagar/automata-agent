import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to the AI Agent Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Select a tool from the sidebar to get started.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/chat">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Chat</h2>
            <p>Engage in a conversation with our AI models.</p>
          </div>
        </Link>
        <Link href="/automation">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Automation</h2>
            <p>Automate web tasks with our AI-powered agent.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
