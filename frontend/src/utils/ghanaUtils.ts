// Ghana-specific utilities for frontend

// Ghana regions with their major cities
export const ghanaRegions = {
  'Greater Accra': ['Accra', 'Tema', 'Kasoa', 'Madina', 'East Legon', 'Ablekuma'],
  'Ashanti': ['Kumasi', 'Suame', 'Koforidua', 'Sunyani', 'Tamale'],
  'Western': ['Takoradi', 'Sekondi-Takoradi', 'Cape Coast', 'Elmina'],
  'Northern': ['Tamale', 'Bolgatanga', 'Wa', 'Navrongo'],
  'Eastern': ['Koforidua', 'Akosombo', 'Nkawkaw', 'New Juaben'],
  'Volta': ['Ho', 'Keta', 'Hohoe', 'Aflao'],
  'Central': ['Cape Coast', 'Elmina', 'Winneba', 'Kasoa'],
  'Brong Ahafo': ['Sunyani', 'Techiman', 'Berekum', 'Nkoranza'],
  'Upper East': ['Bolgatanga', 'Bawku', 'Navrongo', 'Zuarungu'],
  'Upper West': ['Wa', 'Tumu', 'Jirapa', 'Lawra'],
  'Ahafo': ['Bechem', 'Goaso', 'Mim', 'Kenyasi'],
  'North East': ['Nalerigu', 'Gambaga', 'Walewale', 'Bunkpurugu'],
  'Oti': ['Dambai', 'Jasikan', 'Kpassa', 'Kete Krachi'],
  'Savannah': ['Damongo', 'Buipe', 'Salaga', 'Yapei'],
  'Western North': ['Sefwi Wiawso', 'Bibiani', 'Bekwai', 'Juaboso']
};

// Ghana public holidays
export const ghanaHolidays = [
  { name: 'New Year\'s Day', date: '01-01' },
  { name: 'Independence Day', date: '03-06' },
  { name: 'Labour Day', date: '05-01' },
  { name: 'Republic Day', date: '07-01' },
  { name: 'Founders\' Day', date: '09-21' },
  { name: 'Christmas Day', date: '12-25' },
  { name: 'Boxing Day', date: '12-26' }
];

// Ghana phone number validation
export const validateGhanaPhone = (phone: string): boolean => {
  const ghanaPhoneRegex = /^(\+233|0)?[0-9]{9,10}$/;
  return ghanaPhoneRegex.test(phone);
};

// Format Ghana phone number to international format
export const formatGhanaPhone = (phone: string): string | null => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with +233
  if (digits.startsWith('0')) {
    return '+233' + digits.substring(1);
  }
  
  // If starts with 233, add +
  if (digits.startsWith('233')) {
    return '+' + digits;
  }
  
  // If already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: add +233
  return '+233' + digits;
};

// Ghana Card ID validation
export const validateGhanaCardId = (cardId: string): boolean => {
  const ghanaCardRegex = /^GHA-[0-9]{9}-[0-9]$/;
  return ghanaCardRegex.test(cardId);
};

// GhanaPost GPS validation
export const validateGhanaPostGPS = (gps: string): boolean => {
  const ghanaGPSRegex = /^[A-Z]{2}-[0-9]{3}-[0-9]{4}$/;
  return ghanaGPSRegex.test(gps);
};

// Check if date is a Ghana public holiday
export const isGhanaHoliday = (date: Date): boolean => {
  const monthDay = String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
  return ghanaHolidays.some(holiday => holiday.date === monthDay);
};

// Get Ghana region from location
export const getGhanaRegion = (location: string): string | null => {
  const locationLower = location.toLowerCase();
  
  for (const [region, cities] of Object.entries(ghanaRegions)) {
    for (const city of cities) {
      if (locationLower.includes(city.toLowerCase())) {
        return region;
      }
    }
  }
  
  return null;
};

// Calculate regional pricing adjustment
export const getRegionalPricingAdjustment = (location: string): number => {
  const region = getGhanaRegion(location);
  
  const adjustments: Record<string, number> = {
    'Greater Accra': 1.2,  // 20% higher in Accra
    'Ashanti': 1.1,        // 10% higher in Kumasi
    'Western': 1.05,       // 5% higher in Takoradi
    'Northern': 0.9,       // 10% lower in Northern region
    'Upper East': 0.85,    // 15% lower in Upper East
    'Upper West': 0.85     // 15% lower in Upper West
  };
  
  return region ? adjustments[region] || 1.0 : 1.0;
};

// Ghana currency formatting
export const formatGhanaCedis = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Mobile money network detection
export const detectMobileMoneyNetwork = (phone: string): string => {
  const formattedPhone = formatGhanaPhone(phone);
  if (!formattedPhone) return 'Unknown';
  
  const prefix = formattedPhone.substring(4, 7); // Get first 3 digits after +233
  
  const networks: Record<string, string[]> = {
    'MTN': ['024', '025', '054', '055', '059'],
    'Vodafone': ['020', '050'],
    'AirtelTigo': ['026', '027', '056', '057'],
    'Glo': ['023']
  };
  
  for (const [network, prefixes] of Object.entries(networks)) {
    if (prefixes.includes(prefix)) {
      return network;
    }
  }
  
  return 'Unknown';
};

// Ghana time zone formatting
export const formatGhanaTime = (date: Date): string => {
  const ghanaTime = new Date(date);
  // Ghana is UTC+0 (GMT)
  return ghanaTime.toISOString().replace('Z', '+00:00');
};

// Ghana business hours (typically 8 AM - 5 PM)
export const isBusinessHours = (date: Date = new Date()): boolean => {
  const hours = date.getUTCHours(); // Ghana is UTC+0
  return hours >= 8 && hours < 17;
};

// Ghana working days (Monday - Friday)
export const isWorkingDay = (date: Date = new Date()): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // 1 = Monday, 5 = Friday
};

// Get next working day in Ghana
export const getNextWorkingDay = (date: Date = new Date()): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isWorkingDay(nextDay) || isGhanaHoliday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

// Ghana-specific address validation
export const validateGhanaAddress = (address: string): { valid: boolean; reason?: string; region?: string } => {
  if (!address || address.length < 10) {
    return { valid: false, reason: 'Address too short' };
  }
  
  // Check if address contains a Ghana location
  const region = getGhanaRegion(address);
  if (!region) {
    return { valid: false, reason: 'Unknown Ghana location' };
  }
  
  return { valid: true, region };
};

// Ghana service availability by region
export const getRegionalServiceAvailability = (category: string, location: string) => {
  const region = getGhanaRegion(location);
  
  const availability: Record<string, { all: boolean; specialties: string[] }> = {
    'Greater Accra': {
      all: true,
      specialties: ['electrical', 'plumbing', 'air_conditioning', 'solar', 'security']
    },
    'Ashanti': {
      all: true,
      specialties: ['electrical', 'plumbing', 'carpentry', 'general_repairs']
    },
    'Western': {
      all: true,
      specialties: ['electrical', 'plumbing', 'painting', 'general_repairs']
    },
    'Northern': {
      all: false,
      specialties: ['electrical', 'plumbing', 'general_repairs']
    },
    'Upper East': {
      all: false,
      specialties: ['general_repairs']
    },
    'Upper West': {
      all: false,
      specialties: ['general_repairs']
    }
  };
  
  const regionAvailability = region ? availability[region] : { all: false, specialties: ['general_repairs'] };
  
  return {
    available: regionAvailability.all || regionAvailability.specialties.includes(category),
    region: region || 'Unknown',
    availableSpecialties: regionAvailability.specialties
  };
};

// Ghana-specific service categories
export const ghanaServiceCategories = [
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'carpentry', name: 'Carpentry', icon: '🔨' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'air_conditioning', name: 'Air Conditioning', icon: '❄️' },
  { id: 'masonry', name: 'Masonry', icon: '🧱' },
  { id: 'roofing', name: 'Roofing', icon: '🏠' },
  { id: 'aluminium', name: 'Aluminium', icon: '🔩' },
  { id: 'general_repairs', name: 'General Repairs', icon: '🛠️' },
  { id: 'generator', name: 'Generator', icon: '⚡' },
  { id: 'solar', name: 'Solar Installation', icon: '☀️' },
  { id: 'security', name: 'Security', icon: '🔒' }
];

// Local language support (basic)
export const localLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi' },
  { code: 'ga', name: 'Ga', nativeName: 'Ga' },
  { code: 'ee', name: 'Ewe', nativeName: 'Ewe' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' }
];

// Ghana-specific validation messages
export const ghanaValidationMessages = {
  phone: 'Please enter a valid Ghana phone number (e.g., 0241234567 or +233241234567)',
  ghanaCard: 'Please enter a valid Ghana Card ID (e.g., GHA-123456789-0)',
  gps: 'Please enter a valid GhanaPost GPS code (e.g., AK-039-5021)',
  address: 'Please enter a valid Ghana address'
};

// Ghana-specific constants
export const ghanaConstants = {
  currency: 'GHS',
  currencySymbol: '₵',
  country: 'Ghana',
  callingCode: '+233',
  timeOffset: '+00:00',
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  businessHours: { start: 8, end: 17 }, // 8 AM to 5 PM
  regions: Object.keys(ghanaRegions)
};