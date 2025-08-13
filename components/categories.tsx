import { Card, CardContent } from "@/components/ui/card"
import { Sofa, Bed, UtensilsCrossed, Laptop } from "lucide-react"
import Image from "next/image"

const categories = [
  {
    id: 1,
    name: "Living Room",
    description: "Comfortable sofas, coffee tables & entertainment units",
    icon: Sofa,
    image: "/placeholder.svg?height=300&width=400",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: 2,
    name: "Bedroom",
    description: "Cozy beds, wardrobes & nightstands for perfect rest",
    icon: Bed,
    image: "/placeholder.svg?height=300&width=400",
    color: "from-teal-400 to-cyan-500",
  },
  {
    id: 3,
    name: "Dining Room",
    description: "Elegant dining tables, chairs & storage solutions",
    icon: UtensilsCrossed,
    image: "/placeholder.svg?height=300&width=400",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: 4,
    name: "Home Office",
    description: "Productive desks, ergonomic chairs & smart storage",
    icon: Laptop,
    image: "/placeholder.svg?height=300&width=400",
    color: "from-blue-400 to-indigo-500",
  },
]

export function Categories() {
  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect furniture for every room in your home
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
