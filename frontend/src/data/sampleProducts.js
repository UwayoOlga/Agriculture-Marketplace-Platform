const sampleProducts = [
  {
    id: 1,
    name: "Rwandan Arabica Coffee",
    description: "Premium Rwandan Arabica coffee beans, hand-picked from the volcanic slopes of Rwanda. Known for its rich flavor and smooth finish, perfect for coffee enthusiasts.",
    price: 8.99,
    category: { id: 1, name: "Coffee" },
    image: "https://images.unsplash.com/photo-1447933601403-0fb668e364db?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: true,
    location: "Northern Province",
    quantity: 100,
    unit: "kg",
    rating: 4.8,
    vendor: "Volcano Coffee Co.",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1447933601403-0fb668e364db?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 2,
    name: "Rwandan Tea Leaves",
    description: "High-quality black tea leaves from Rwanda's tea plantations. Grown in the highlands for a rich, full-bodied flavor that's perfect for any time of day.",
    price: 5.50,
    category: { id: 2, name: "Tea" },
    image: "https://images.unsplash.com/photo-1558168807-915c0e76a6e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: false,
    location: "Nyungwe",
    quantity: 200,
    unit: "kg",
    rating: 4.5,
    vendor: "Nyungwe Tea Estates",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1558168807-915c0e76a6e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1517101724602-c257fe56813b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 3,
    name: "East African Highland Bananas",
    description: "Sweet and nutritious Matoke bananas, a staple food in Rwanda. These cooking bananas are rich in potassium and perfect for traditional Rwandan dishes.",
    price: 2.50,
    category: { id: 3, name: "Fruits" },
    image: "https://images.unsplash.com/photo-1571771370482-9f8108461544?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: true,
    location: "Western Province",
    quantity: 500,
    unit: "bunch",
    rating: 4.7,
    vendor: "Rwanda Fresh Produce",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1571771370482-9f8108461544?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1571771315542-2d9f4d0a50a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 4,
    name: "Rwandan Red Beans",
    description: "Nutritious red beans, rich in protein and fiber. A staple in Rwandan cuisine, perfect for traditional dishes like Ibiharage.",
    price: 3.20,
    category: { id: 4, name: "Legumes" },
    image: "https://images.unsplash.com/photo-1586201375761-83865001c8c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: false,
    location: "Eastern Province",
    quantity: 300,
    unit: "kg",
    rating: 4.6,
    vendor: "Rwanda Beans Coop",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1586201375761-83865001c8c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1540148426945-6cf24a6a4a9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 5,
    name: "Rwandan Passion Fruits",
    description: "Sweet and tangy passion fruits, perfect for juices and desserts. Grown in the fertile soils of Rwanda, these fruits are packed with vitamins and antioxidants.",
    price: 4.50,
    category: { id: 3, name: "Fruits" },
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: true,
    location: "Southern Province",
    quantity: 150,
    unit: "kg",
    rating: 4.9,
    vendor: "Rwanda Fruits Export",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1519683109079-d1f1a2f3b2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 6,
    name: "Rwandan Avocados",
    description: "Creamy and nutritious Hass avocados, perfect for healthy eating. Grown in Rwanda's ideal climate, these avocados are rich in healthy fats and vitamins.",
    price: 6.75,
    category: { id: 3, name: "Fruits" },
    image: "https://images.unsplash.com/photo-1601493707431-3f95c5d210bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: true,
    location: "Western Province",
    quantity: 180,
    unit: "kg",
    rating: 4.8,
    vendor: "Rwanda Avocado Farms",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1601493707431-3f95c5d210bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 7,
    name: "Rwandan Sweet Potatoes",
    description: "Naturally sweet and rich in vitamins, a staple food in Rwanda. These orange-fleshed sweet potatoes are packed with beta-carotene and essential nutrients.",
    price: 2.80,
    category: { id: 5, name: "Root Crops" },
    image: "https://images.unsplash.com/photo-1518977676601-b53fcc967d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: true,
    location: "Northern Province",
    quantity: 400,
    unit: "kg",
    rating: 4.7,
    vendor: "Rwanda Fresh Produce",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1518977676601-b53fcc967d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" },
      { id: 2, image: "https://images.unsplash.com/photo-1589927986086-c7a35e2d128f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" }
    ]
  },
  {
    id: 8,
    name: "Rwandan Pineapples",
    description: "Sweet and juicy pineapples, grown in Rwanda's tropical climate",
    price: 3.50,
    category: { id: 3, name: "Fruits" },
    image: "https://images.unsplash.com/photo-1550258987-1c9ff8fda02a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    is_organic: false,
    location: "Eastern Province",
    quantity: 250,
    unit: "piece",
    rating: 4.6,
    vendor: "Rwanda Fruits Export"
  }
];

const sampleCategories = [
  { id: 1, name: "Coffee" },
  { id: 2, name: "Tea" },
  { id: 3, name: "Fruits" },
  { id: 4, name: "Vegetables" },
  { id: 5, name: "Grains" },
  { id: 6, name: "Legumes" },
  { id: 7, name: "Root Crops" },
  { id: 8, name: "Spices" },
  { id: 9, name: "Nuts & Seeds" },
  { id: 10, name: "Herbs" },
  { id: 11, name: "Dairy" },
  { id: 12, name: "Honey" },
  { id: 13, name: "Other" }
];

export { sampleProducts, sampleCategories };

export default sampleProducts;
