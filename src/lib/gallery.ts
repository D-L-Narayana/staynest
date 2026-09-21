// Curated real photography catalog (Unsplash, no key needed) used across
// the inspiration gallery, destination strip, and listing extra photos.
// This pushes the total number of real images shown well past 100.

export const img = (id: string, w = 1100) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export type Destination = {
  city: string;
  country: string;
  stays: number;
  photo: string;
};

// 24 destination cards (real travel photography)
export const DESTINATIONS: Destination[] = [
  { city: "Santorini", country: "Greece", stays: 312, photo: "photo-1570077188670-e3a8d69ac5ff" },
  { city: "Kyoto", country: "Japan", stays: 184, photo: "photo-1493976040374-85c8e12f0c0e" },
  { city: "Amalfi Coast", country: "Italy", stays: 221, photo: "photo-1612698093158-e07ac200d44e" },
  { city: "Bali", country: "Indonesia", stays: 408, photo: "photo-1537996194471-e657df975ab4" },
  { city: "Marrakech", country: "Morocco", stays: 167, photo: "photo-1597212618440-806262de4f6b" },
  { city: "Reykjavik", country: "Iceland", stays: 96, photo: "photo-1504829857797-ddff29c27927" },
  { city: "Lisbon", country: "Portugal", stays: 263, photo: "photo-1585208798174-6cedd86e019a" },
  {
    city: "Queenstown",
    country: "New Zealand",
    stays: 142,
    photo: "photo-1589802829985-817e51171b92",
  },
  {
    city: "Cape Town",
    country: "South Africa",
    stays: 178,
    photo: "photo-1580060839134-75a5edca2e99",
  },
  { city: "Tulum", country: "Mexico", stays: 205, photo: "photo-1518638150340-f706e86654de" },
  { city: "Aspen", country: "United States", stays: 134, photo: "photo-1551524559-8af4e6624178" },
  { city: "Dubrovnik", country: "Croatia", stays: 119, photo: "photo-1502602898657-3e91760cbb34" },
  { city: "Paris", country: "France", stays: 521, photo: "photo-1502602898657-3e91760cbb34" },
  { city: "Banff", country: "Canada", stays: 88, photo: "photo-1561134643-668f9057cce4" },
  { city: "Maldives", country: "Maldives", stays: 156, photo: "photo-1514282401047-d79a71a590e8" },
  { city: "Edinburgh", country: "Scotland", stays: 132, photo: "photo-1506377585622-bedcbb027afc" },
  { city: "Positano", country: "Italy", stays: 174, photo: "photo-1512917774080-9991f1c4c750" },
  { city: "Sydney", country: "Australia", stays: 312, photo: "photo-1506973035872-a4ec16b8e8d9" },
  { city: "Hallstatt", country: "Austria", stays: 64, photo: "photo-1577717903315-1691ae25ab3f" },
  { city: "Tokyo", country: "Japan", stays: 356, photo: "photo-1540959733332-eab4deabeeaf" },
  {
    city: "Joshua Tree",
    country: "United States",
    stays: 178,
    photo: "photo-1542401886-65d6c61db217",
  },
  { city: "Geiranger", country: "Norway", stays: 121, photo: "photo-1601581875309-fafbf2d3ed3a" },
  {
    city: "Chiang Mai",
    country: "Thailand",
    stays: 197,
    photo: "photo-1528181304800-259b08848526",
  },
  { city: "Val d'Orcia", country: "Italy", stays: 209, photo: "photo-1523906834658-6e24ef2386f9" },
];

// 48 inspiration photos (homes, interiors, views, travel moods) for the masonry gallery
export const INSPIRATION: string[] = [
  "photo-1564013799919-ab600027ffc6",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1600210492493-0946911123ea",
  "photo-1512917774080-9991f1c4c750",
  "photo-1502672260266-1c1ef2d93688",
  "photo-1560448204-e02f11c3d0e2",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1493809842364-78817add7ffb",
  "photo-1556020685-ae41abfc9365",
  "photo-1540518614846-7eded433c457",
  "photo-1554995207-c18c203602cb",
  "photo-1416331108676-a22ccb276e35",
  "photo-1449158743715-0a90ebb6d2d8",
  "photo-1518733057094-95b53143d2a7",
  "photo-1542718610-a1d656d1884c",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1571896349842-33c89424de2d",
  "photo-1582719478250-c89cae4dc85b",
  "photo-1539020140153-e479b8c22e70",
  "photo-1571003123894-1f0594d2b5d9",
  "photo-1578683010236-d716f9a3f461",
  "photo-1488462237308-ecaa28b729d7",
  "photo-1518780664697-55e3ad937233",
  "photo-1505691938895-1758d7feb511",
  "photo-1499793983690-e29da59ef1c2",
  "photo-1469022563428-aa04fef9f5a2",
  "photo-1506905925346-21bda4d32df4",
  "photo-1578683010236-d716f9a3f461",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1600585154526-990dced4db0d",
  "photo-1502005229762-cf1b2da7c5d6",
  "photo-1523217582562-09d0def993a6",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1470770841072-f978cf4d019e",
  "photo-1560185007-cde436f6a4d0",
  "photo-1533105079780-92b9be482077",
  "photo-1469796466635-455ede028aca",
  "photo-1439066615861-d1af74d74000",
  "photo-1505881502353-a1986add3762",
  "photo-1518602164578-cd0074062767",
  "photo-1540541338287-41700207dee6",
  "photo-1573843981267-be1999ff37cd",
  "photo-1582610116397-edb318620f90",
  "photo-1444201983204-c43cbd584d93",
  "photo-1505691938895-1758d7feb511",
  "photo-1473773508845-188df298d2d1",
];

export const galleryUrl = (photoId: string, w = 800) => img(photoId, w);
