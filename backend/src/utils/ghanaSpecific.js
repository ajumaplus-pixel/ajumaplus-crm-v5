// Ghana-specific utilities and helpers

// Ghana regions and their major cities
const ghanaRegions = {
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
const ghanaHolidays = [
  '01-01', // New Year's Day
  '03-06', // Independence Day
  '05-01', // Labour Day
  '07-01', // Republic Day
  '09-21', // Founders' Day
  '12-25', // Christmas Day
  '12-26'  // Boxing Day
];

// Ghana phone number validation
const validateGhanaPhone = (phone) => {
  const ghanaPhoneRegex = /^(\+233|0)?[0-9]{9,10}$/;
  return ghanaPhoneRegex.test(phone);
};

// Format Ghana phone number to international format
const formatGhanaPhone = (phone) => {
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
const validateGhanaCardId = (cardId) => {
  const ghanaCardRegex = /^GHA-[0-9]{9}-[0-9]$/;
  return ghanaCardRegex.test(cardId);
};

// GhanaPost GPS validation
const validateGhanaPostGPS = (gps) => {
  const ghanaGPSRegex = /^[A-Z]{2}-[0-9]{3}-[0-9]{4}$/;
  return ghanaGPSRegex.test(gps);
};

// Check if date is a Ghana public holiday
const isGhanaHoliday = (date) => {
  const dateObj = new Date(date);
  const monthDay = String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(dateObj.getDate()).padStart(2, '0');
  return ghanaHolidays.includes(monthDay);
};

// Get Ghana region from location
const getGhanaRegion = (location) => {
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
const getRegionalPricingAdjustment = (location) => {
  const region = getGhanaRegion(location);
  
  const adjustments = {
    'Greater Accra': 1.2,  // 20% higher in Accra
    'Ashanti': 1.1,        // 10% higher in Kumasi
    'Western': 1.05,       // 5% higher in Takoradi
    'Northern': 0.9,       // 10% lower in Northern region
    'Upper East': 0.85,    // 15% lower in Upper East
    'Upper West': 0.85     // 15% lower in Upper West
  };
  
  return adjustments[region] || 1.0;
};

// Ghana currency formatting
const formatGhanaCedis = (amount) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Mobile money network detection
const detectMobileMoneyNetwork = (phone) => {
  const formattedPhone = formatGhanaPhone(phone);
  if (!formattedPhone) return null;
  
  const prefix = formattedPhone.substring(4, 7); // Get first 3 digits after +233
  
  const networks = {
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
const formatGhanaTime = (date) => {
  const ghanaTime = new Date(date);
  // Ghana is UTC+0 (GMT)
  return ghanaTime.toISOString().replace('Z', '+00:00');
};

// Calculate distance between two Ghana locations (simplified)
const calculateDistance = (location1, location2) => {
  // In production, this would use Google Maps API
  // For now, return a simplified distance based on regions
  const region1 = getGhanaRegion(location1);
  const region2 = getGhanaRegion(location2);
  
  if (region1 === region2) return 10; // Same region: ~10km
  if (region1 === 'Greater Accra' || region2 === 'Greater Accra') return 200; // To/from Accra: ~200km
  return 100; // Different regions: ~100km
};

// Ghana business hours (typically 8 AM - 5 PM)
const isBusinessHours = (date = new Date()) => {
  const ghanaTime = new Date(date);
  const hours = ghanaTime.getUTCHours(); // Ghana is UTC+0
  
  return hours >= 8 && hours < 17;
};

// Ghana working days (Monday - Friday)
const isWorkingDay = (date = new Date()) => {
  const day = new Date(date).getDay();
  return day >= 1 && day <= 5; // 1 = Monday, 5 = Friday
};

// Get next working day in Ghana
const getNextWorkingDay = (date = new Date()) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isWorkingDay(nextDay) || isGhanaHoliday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

// Ghana-specific address validation
const validateGhanaAddress = (address) => {
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
const getRegionalServiceAvailability = (category, location) => {
  const region = getGhanaRegion(location);
  
  const availability = {
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
  
  const regionAvailability = availability[region] || { all: false, specialties: ['general_repairs'] };
  
  return {
    available: regionAvailability.all || regionAvailability.specialties.includes(category),
    region,
    availableSpecialties: regionAvailability.specialties
  };
};

module.exports = {
  ghanaRegions,
  ghanaHolidays,
  validateGhanaPhone,
  formatGhanaPhone,
  validateGhanaCardId,
  validateGhanaPostGPS,
  isGhanaHoliday,
  getGhanaRegion,
  getRegionalPricingAdjustment,
  formatGhanaCedis,
  detectMobileMoneyNetwork,
  formatGhanaTime,
  calculateDistance,
  isBusinessHours,
  isWorkingDay,
  getNextWorkingDay,
  validateGhanaAddress,
  getRegionalServiceAvailability
};