import { Button } from "@/components/ui/button";
import { ShoppingBag, Coffee } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 blob-1 opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 blob-2 opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal/10 to-sunshine/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-sunshine px-6 py-3 rounded-full shadow-lg mb-8 hover-bounce">
              <span className="text-2xl animate-spin">✨</span>
              <span className="font-bold text-dark-gray">New Collection Available</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              Transform Your 
              <span className="text-gradient-playful block">Living Space</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              Discover handcrafted furniture that brings warmth, comfort, and style to every corner of your home. Plus, enjoy our cozy café experience! 
              <span className="text-2xl">🏠✨</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button className="bg-gradient-to-r from-coral to-coral-light text-white px-8 py-4 rounded-full font-bold text-lg shadow-playful hover:shadow-xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Collection
              </Button>
              <Button className="bg-gradient-to-r from-teal to-teal-light text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 hover:rotate-1 transition-all duration-300">
                <Coffee className="mr-2 h-5 w-5" />
                Visit Our Café
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center hover-lift transition-all duration-300">
                <div className="text-4xl font-black text-gradient-playful">2000+</div>
                <div className="text-gray-600 font-semibold">Happy Customers</div>
              </div>
              <div className="text-center hover-lift transition-all duration-300">
                <div className="text-4xl font-black text-gradient-playful">500+</div>
                <div className="text-gray-600 font-semibold">Furniture Pieces</div>
              </div>
              <div className="text-center hover-lift transition-all duration-300">
                <div className="text-4xl font-black text-gradient-playful">50+</div>
                <div className="text-gray-600 font-semibold">Café Delights</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Modern living room with colorful furniture" 
              className="w-full rounded-3xl shadow-2xl transform hover:rotate-2 transition-all duration-500 relative z-10"
            />
            
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-sunshine to-pink rounded-full opacity-80 animate-float"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple to-lime rounded-full opacity-70 animate-bounce-slow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}