import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Plus, User, Clock, Video } from "lucide-react"

export default function Dashboard() {
  const projects = [
    {
      id: 1,
      title: "Summer Sale Campaign",
      lastModified: "2 hours ago",
      status: "In Progress",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 2,
      title: "Product Launch Video",
      lastModified: "1 day ago",
      status: "Completed",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 3,
      title: "Brand Awareness Ad",
      lastModified: "3 days ago",
      status: "Draft",
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">AdSpark</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-slate-400">Ready to create your next amazing ad?</p>
        </div>

        {/* New Project Section */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <Plus className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Start New Ad Project</h2>
              <p className="text-slate-400 mb-6">
                Transform your creative idea into a stunning video advertisement with AI assistance
              </p>
              <Link href="/create/idea">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create New Ad
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Existing Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              >
                <CardHeader className="p-0">
                  <div className="aspect-video bg-slate-700 rounded-t-lg overflow-hidden">
                    <img
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {project.lastModified}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        project.status === "Completed"
                          ? "bg-green-900 text-green-300"
                          : project.status === "In Progress"
                            ? "bg-blue-900 text-blue-300"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
