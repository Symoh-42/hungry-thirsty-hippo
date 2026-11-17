// Transcribed from the business's own menu ("The Hungry & Thirsty Hippo Menu.pdf", October 2026).
// Prices in Kenya shillings. Update here when the menu changes.

export interface MenuItem {
  name: string;
  price: string;
  note?: string;
}
export interface MenuSection {
  id: string;
  title: string;
  image: string;
  note?: string;
  items: MenuItem[];
}

export const menu: MenuSection[] = [
  {
    id: "breakfast",
    title: "Breakfast",
    image: "breakfast.jpg",
    items: [
      { name: "Full Breakfast", price: "1,000", note: "Tea/coffee, eggs, toast, sausage, potatoes, fruits" },
      { name: "Mini Breakfast", price: "600", note: "Tea/coffee, eggs, toast, sausage, fruits" },
      { name: "Spanish omelette", price: "200" },
      { name: "Lyonnaise potatoes", price: "300" },
      { name: "Eggs", price: "100", note: "Sunny side-up, fried, scrambled or boiled" },
      { name: "French toast", price: "100" },
      { name: "Pancakes", price: "100" },
      { name: "Toast", price: "50" },
      { name: "Mandazi", price: "50" },
    ],
  },
  {
    id: "mains",
    title: "Mains",
    image: "nyama-bbq.jpg",
    items: [
      { name: "Kienyeji Chicken", price: "2,400" },
      { name: "Broiler Chicken", price: "2,200" },
      { name: "Beef (1kg)", price: "2,200" },
      { name: "Mutton (1kg)", price: "2,200" },
      { name: "Pizza", price: "1,200", note: "Margherita, Meat lovers or Vegetarian" },
      { name: "Pasta bolognese", price: "1,200" },
      { name: "Chicken, fish or beef curry", price: "1,000" },
      { name: "Burger", price: "800" },
      { name: "Loaded fries", price: "800" },
      { name: "Fish", price: "750", note: "Grilled, breaded or whole" },
    ],
  },
  {
    id: "platters",
    title: "Weekend Platters",
    image: "nyama-chapati.jpg",
    note: "Served on weekends",
    items: [
      {
        name: "Hungry and Thirsty Platter",
        price: "4,000",
        note: "Serves 5. Fries, pilau, white rice, chapati, ugali, sausages, smokie, beef/mutton, chicken, kachumbari, coleslaw, greens, soup, fresh juice",
      },
      {
        name: "Serah's Special",
        price: "3,000",
        note: "Serves 3. Fries, pilau, ugali, chapati, beef/mutton, chicken, kachumbari, greens, soup",
      },
    ],
  },
  {
    id: "snacks",
    title: "Snacks & Appetizers",
    image: "samosa.jpg",
    items: [
      { name: "Masala fries", price: "350" },
      { name: "Fries", price: "300" },
      { name: "Choma sausage", price: "250 / pair" },
      { name: "Mishikaki", price: "250 / trio", note: "Beef, chicken or vegetarian" },
      { name: "Potatoes", price: "250", note: "Mashed, roasted or sautéed" },
      { name: "Samosa", price: "150 / pair" },
      { name: "Sausage", price: "150 / pair" },
      { name: "Smokie", price: "100 / pair" },
    ],
  },
  {
    id: "sides",
    title: "Sides & Salads",
    image: "ugali-spinach.jpg",
    items: [
      { name: "Mukimo", price: "300" },
      { name: "Njahi", price: "300" },
      { name: "Githeri", price: "300" },
      { name: "Mixed veggies", price: "250" },
      { name: "Pilau", price: "200" },
      { name: "Steamed spinach", price: "200" },
      { name: "White rice", price: "150" },
      { name: "Ugali", price: "150" },
      { name: "Chapati", price: "100" },
      { name: "Nduma", price: "100" },
      { name: "Ngwaci", price: "100" },
      { name: "Kachumbari", price: "100" },
      { name: "Coleslaw", price: "100" },
    ],
  },
  {
    id: "beverages",
    title: "Beverages",
    image: "masala-chai.jpg",
    note: "Fresh juice subject to availability",
    items: [
      { name: "Latte", price: "250" },
      { name: "Espresso", price: "200" },
      { name: "Special tea", price: "200", note: "Mixed, masala, lemon, dawa or ginger on request" },
      { name: "Milk", price: "200" },
      { name: "Fresh juice", price: "150" },
      { name: "Minute Maid", price: "120" },
      { name: "Tea / Black tea", price: "100" },
      { name: "Soda (300ml)", price: "100" },
      { name: "Mineral water", price: "100" },
    ],
  },
];
