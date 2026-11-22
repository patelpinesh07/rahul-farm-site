/*
  RAHUL FARM WEBSITE SETTINGS
  ---------------------------
  Every business detail on the website comes from this one file.
  Edit the values between the quotes, save, and re-deploy.
  Leave a value empty ('') and the website hides it or shows a
  "confirmed on WhatsApp" line instead, so nothing ever looks broken.

  Prices: write numbers only, no ₹ sign or commas. Example: mrp: 150
  Use null when you don't want to show a price yet.
*/
window.SITE = {
  brand: 'Rahul Farm',

  // Your live website address, no slash at the end. Example: 'https://www.rahulfarm.in'
  domain: '',

  // WhatsApp number with country code, digits only. Example: '919876543210'
  whatsapp: '919979849779',

  // Calling number as you want it shown. Example: '+91 98765 43210'
  phone: '+91 99798 49779',

  email: '',
  address: 'Rahul Farm, Vanskui, Ta. Ambika, Dist. Surat, Gujarat',
  pincode: '394240',
  hours: '',            // Example: 'Mon to Sat, 9 am to 7 pm'

  // ---- LICENCE NUMBERS -------------------------------------------------
  // Shown in the website footer (and next to the shop) as soon as you fill them.
  // FSSAI: your 14-digit FSSAI licence or registration number. Needed for selling food.
  fssai: '',            // Example: '10726011000123'
  // GSTIN: only if you are GST registered, otherwise leave empty.
  gstin: '',            // Example: '24ABCDE1234F1Z5'
  // -----------------------------------------------------------------------

  // Wholesale
  moq: '300 kg',        // Minimum wholesale order. Leave '' to hide.
  payment: '',          // Example: 'UPI or bank transfer before dispatch'

  // Retail shipping (all India by courier)
  dispatchDays: '',     // Example: '1 to 2 working days'
  deliveryDays: '',     // Example: '4 to 7 days'
  shelfLife: '',        // Example: '12 months'

  // Social links, full URLs. Empty = icon hidden
  instagram: 'https://www.instagram.com/rahul.farm/',
  facebook: '',
  youtube: '',

  // Footer credit line: "Website designed & managed by ..."
  creditName: 'Test 1234',   // name shown in the footer
  creditUrl: '',             // optional link, e.g. 'https://yourwebsite.com' (leave '' for plain text)

  // Tracking. Paste the IDs when ready, tracking switches on by itself
  metaPixelId: '1154272696988305',   // Meta Pixel: Rahul Farm (19-11)
  ga4Id: '',            // Example: 'G-XXXXXXXXXX'

  /*
    Products
    mrp            = retail price for one pack (Shop for home)
    wholesale      = wholesale rate (price list)
    wholesaleUnit  = what the wholesale rate is per: 'kg', 'jar', 'pack'
    pack           = pack size shown in the shop
    kg             = weight of one pack in kg (used for the total on product pages), null if not fixed
  */
  products: [
    { id: 'normal',   name: 'Normal Jaggery',       pack: '1 kg bucket', mrp: null, kg: 1, wholesale: null, wholesaleUnit: 'kg' },
    { id: 'masala',   name: 'Masala Jaggery',       pack: '1 kg bucket', mrp: null, kg: 1, wholesale: null, wholesaleUnit: 'kg' },
    { id: 'dryfruit', name: 'Dry Fruit Jaggery',    pack: '1 kg bucket', mrp: null, kg: 1, wholesale: null, wholesaleUnit: 'kg' },
    { id: 'bucket',   name: 'Normal Jaggery Bucket', pack: '4 kg bucket', mrp: null, kg: 4, wholesale: null, wholesaleUnit: 'bucket' },
    { id: 'jar',      name: 'Jaggery Pieces Jar',   pack: 'Jar',        mrp: null, kg: null, wholesale: null, wholesaleUnit: 'jar' },
    { id: 'powder',   name: 'Jaggery Powder',       pack: 'Jar',        mrp: null, kg: null, wholesale: null, wholesaleUnit: 'kg' }
  ]
};
