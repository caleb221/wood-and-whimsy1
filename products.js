// Product Database for Wood & Whimsy
const products = {
  1: {
    id: 1,
    name: "Cozy Cloud Sofa",
    category: "Living Room",
    subcategory: "Sofas",
    price: 899.99,
    originalPrice: 1199.99,
    discount: 25,
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    stockCount: 8,
    sku: "WW-SOFA-001",
    description: "Sink into ultimate comfort with our Cozy Cloud Sofa. Featuring premium memory foam cushions and a durable hardwood frame, this sofa combines style with unmatched comfort.",
    features: [
      "Premium memory foam cushions",
      "Solid hardwood frame construction",
      "Removable and washable covers",
      "Available in 6 color options",
      "10-year structural warranty",
      "Free white-glove delivery"
    ],
    specifications: {
      dimensions: "84\" W x 36\" D x 32\" H",
      weight: "120 lbs",
      material: "100% polyester fabric, hardwood frame",
      colors: ["Charcoal Gray", "Navy Blue", "Cream", "Forest Green", "Burgundy", "Light Gray"],
      assembly: "Minimal assembly required",
      care: "Spot clean only, professional cleaning recommended"
    },
    images: [
      "cozy sofa.jpg",
      "image1.jpeg",
      "image 2.jpeg",
      "living roon.png"
    ],
    tags: ["bestseller", "comfort", "modern", "family-friendly"],
    relatedProducts: [2, 3, 6],
    reviews: [
      {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        date: "2024-01-15",
        title: "Absolutely love this sofa!",
        comment: "The comfort level is incredible. Perfect for movie nights and the quality is outstanding.",
        verified: true,
        helpful: 23
      },
      {
        id: 2,
        name: "Mike Chen",
        rating: 4,
        date: "2024-01-10",
        title: "Great value for money",
        comment: "Solid construction and very comfortable. Delivery was smooth and professional.",
        verified: true,
        helpful: 18
      }
    ]
  },
  2: {
    id: 2,
    name: "Executive Office Chair",
    category: "Office",
    subcategory: "Chairs",
    price: 449.99,
    originalPrice: 599.99,
    discount: 25,
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    stockCount: 15,
    sku: "WW-CHAIR-002",
    description: "Elevate your workspace with our Executive Office Chair. Ergonomically designed with premium leather upholstery and advanced lumbar support for all-day comfort.",
    features: [
      "Genuine leather upholstery",
      "Ergonomic lumbar support",
      "360-degree swivel base",
      "Height adjustable",
      "Smooth-rolling casters",
      "5-year warranty"
    ],
    specifications: {
      dimensions: "26\" W x 30\" D x 42-46\" H",
      weight: "45 lbs",
      material: "Genuine leather, steel frame",
      colors: ["Black", "Brown", "White"],
      assembly: "Assembly required (30 minutes)",
      care: "Leather conditioner recommended monthly"
    },
    images: [
      "executive.jpg",
      "office chair.jpg",
      "placeholder.jpg"
    ],
    tags: ["ergonomic", "professional", "leather", "adjustable"],
    relatedProducts: [4, 5, 6],
    reviews: [
      {
        id: 1,
        name: "David Wilson",
        rating: 5,
        date: "2024-01-20",
        title: "Perfect for long work days",
        comment: "The lumbar support is excellent. No more back pain after long work sessions.",
        verified: true,
        helpful: 31
      }
    ]
  },
  3: {
    id: 3,
    name: "Harmony Dining Table",
    category: "Dining Room",
    subcategory: "Tables",
    price: 749.99,
    originalPrice: 949.99,
    discount: 21,
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    stockCount: 5,
    sku: "WW-TABLE-003",
    description: "Bring elegance to your dining space with the Harmony Dining Table. Crafted from solid oak with a beautiful natural finish that seats 6 comfortably.",
    features: [
      "Solid oak construction",
      "Natural wood finish",
      "Seats 6 people comfortably",
      "Scratch-resistant surface",
      "Easy assembly",
      "Lifetime warranty on structure"
    ],
    specifications: {
      dimensions: "72\" L x 36\" W x 30\" H",
      weight: "85 lbs",
      material: "Solid oak wood",
      colors: ["Natural Oak", "Dark Walnut", "White Oak"],
      assembly: "Assembly required (45 minutes)",
      care: "Dust regularly, use wood polish monthly"
    },
    images: [
      "harmony dining table.jpg",
      "dining-room04.jpg",
      "image 3.jpg"
    ],
    tags: ["solid-wood", "dining", "elegant", "family-size"],
    relatedProducts: [1, 4, 5],
    reviews: [
      {
        id: 1,
        name: "Emma Rodriguez",
        rating: 5,
        date: "2024-01-18",
        title: "Beautiful craftsmanship",
        comment: "The wood quality is exceptional. Perfect size for our family dinners.",
        verified: true,
        helpful: 42
      }
    ]
  },
  4: {
    id: 4,
    name: "Serenity Bedroom Set",
    category: "Bedroom",
    subcategory: "Sets",
    price: 1299.99,
    originalPrice: 1699.99,
    discount: 24,
    rating: 4.7,
    reviewCount: 203,
    inStock: true,
    stockCount: 3,
    sku: "WW-BEDROOM-004",
    description: "Transform your bedroom into a peaceful retreat with our Serenity Bedroom Set. Includes queen bed frame, two nightstands, and a dresser with mirror.",
    features: [
      "Complete 4-piece set",
      "Queen size bed frame",
      "Two matching nightstands",
      "6-drawer dresser with mirror",
      "Soft-close drawer slides",
      "15-year warranty"
    ],
    specifications: {
      dimensions: "Bed: 64\" W x 84\" L x 48\" H",
      weight: "250 lbs (total set)",
      material: "Engineered wood with veneer finish",
      colors: ["White", "Gray", "Natural"],
      assembly: "Professional assembly recommended",
      care: "Dust with microfiber cloth"
    },
    images: [
      "bed.jpg",
      "image 4.jpg",
      "image 5.jpg"
    ],
    tags: ["bedroom-set", "complete", "storage", "modern"],
    relatedProducts: [2, 5, 6],
    reviews: [
      {
        id: 1,
        name: "Jennifer Lee",
        rating: 5,
        date: "2024-01-12",
        title: "Love the complete set!",
        comment: "Everything matches perfectly. The quality exceeded my expectations.",
        verified: true,
        helpful: 38
      }
    ]
  },
  5: {
    id: 5,
    name: "Modern Coffee Table",
    category: "Living Room",
    subcategory: "Tables",
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    rating: 4.5,
    reviewCount: 94,
    inStock: true,
    stockCount: 12,
    sku: "WW-COFFEE-005",
    description: "Add contemporary style to your living room with our Modern Coffee Table. Features tempered glass top and sleek metal legs for a minimalist aesthetic.",
    features: [
      "Tempered glass top",
      "Powder-coated steel legs",
      "Modern minimalist design",
      "Easy to clean surface",
      "Stable construction",
      "2-year warranty"
    ],
    specifications: {
      dimensions: "48\" L x 24\" W x 16\" H",
      weight: "35 lbs",
      material: "Tempered glass, powder-coated steel",
      colors: ["Clear Glass/Black", "Clear Glass/Chrome", "Clear Glass/Gold"],
      assembly: "Assembly required (20 minutes)",
      care: "Glass cleaner recommended"
    },
    images: [
      "glass.jpeg",
      "image 6.jpg",
      "placeholder.jpg"
    ],
    tags: ["modern", "glass", "minimalist", "contemporary"],
    relatedProducts: [1, 3, 6],
    reviews: [
      {
        id: 1,
        name: "Alex Thompson",
        rating: 4,
        date: "2024-01-14",
        title: "Sleek and functional",
        comment: "Perfect size for our living room. The glass top is very sturdy.",
        verified: true,
        helpful: 15
      }
    ]
  },
  6: {
    id: 6,
    name: "Industrial Bookshelf",
    category: "Office",
    subcategory: "Storage",
    price: 399.99,
    originalPrice: 499.99,
    discount: 20,
    rating: 4.4,
    reviewCount: 76,
    inStock: true,
    stockCount: 7,
    sku: "WW-SHELF-006",
    description: "Organize your space with style using our Industrial Bookshelf. Combines rustic wood shelves with sturdy metal framework for a modern industrial look.",
    features: [
      "5-tier open shelving",
      "Rustic wood shelves",
      "Industrial metal frame",
      "Adjustable shelf heights",
      "Anti-tip safety feature",
      "3-year warranty"
    ],
    specifications: {
      dimensions: "31\" W x 13\" D x 70\" H",
      weight: "55 lbs",
      material: "Reclaimed wood, steel frame",
      colors: ["Rustic Brown/Black", "Natural/Chrome", "Dark Walnut/Bronze"],
      assembly: "Assembly required (60 minutes)",
      care: "Dust regularly, avoid moisture"
    },
    images: [
      "book shelf.jpg",
      "placeholder.jpg",
      "placeholder.jpg"
    ],
    tags: ["industrial", "storage", "bookshelf", "rustic"],
    relatedProducts: [2, 4, 5],
    reviews: [
      {
        id: 1,
        name: "Maria Garcia",
        rating: 4,
        date: "2024-01-16",
        title: "Great storage solution",
        comment: "Sturdy construction and looks great in my home office.",
        verified: true,
        helpful: 22
      }
    ]
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = products;
} else {
  window.products = products;
}
