export const deviceTypes = [
  'PC Fixe',
  'PC Portable',
  'Smartphone',
  'Tablette',
  'Console de jeux',
  'Imprimante',
  'Montre connectée'
];

export const brandsByType: Record<string, string[]> = {
  'PC Fixe': ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Apple'],
  'PC Portable': ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Apple'],
  'Smartphone': ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Google', 'OnePlus', 'Sony'],
  'Tablette': ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Microsoft'],
  'Console de jeux': ['Sony', 'Microsoft', 'Nintendo'],
  'Imprimante': ['HP', 'Epson', 'Canon', 'Brother'],
  'Montre connectée': ['Apple', 'Samsung', 'Garmin', 'Fitbit']
};

export const modelsByBrand: Record<string, string[]> = {
  'Apple': ['iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12',
            'MacBook Pro 14"', 'MacBook Pro 16"', 'MacBook Air', 'iMac 24"', 'iPad Pro', 'iPad Air',
            'Apple Watch Series 9', 'Apple Watch SE'],
  'Samsung': ['Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S22', 'Galaxy S21',
              'Galaxy Tab S9', 'Galaxy Tab S8', 'Galaxy Book3 Pro',
              'Galaxy Watch 6', 'Galaxy Watch 5'],
  'Huawei': ['P60 Pro', 'P50 Pro', 'P40 Pro', 'Mate 50 Pro', 'MatePad Pro',
             'MateBook X Pro', 'MateBook D'],
  'Xiaomi': ['13 Pro', '13', '12 Pro', '12', 'Redmi Note 12', 'Redmi Note 11'],
  'HP': ['Pavilion', 'OMEN', 'Spectre x360', 'EliteBook', 'ProBook', 'ENVY'],
  'Dell': ['XPS 13', 'XPS 15', 'XPS 17', 'Inspiron', 'Latitude', 'Precision'],
  'Lenovo': ['ThinkPad X1', 'ThinkPad T14', 'IdeaPad', 'Legion', 'Yoga'],
  'Asus': ['ROG Strix', 'ZenBook', 'TUF Gaming', 'VivoBook', 'ProArt'],
  'Sony': ['PlayStation 5', 'PlayStation 4', 'PlayStation 4 Pro'],
  'Microsoft': ['Surface Pro 9', 'Surface Laptop 5', 'Surface Book 3', 'Xbox Series X', 'Xbox Series S'],
  'Nintendo': ['Switch OLED', 'Switch', 'Switch Lite']
};