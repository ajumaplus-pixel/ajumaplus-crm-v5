/**
 * Ghana-specific validation utilities
 * Handles phone numbers, GhanaPost GPS codes, and other Ghana-specific validations
 */

export const GhanaValidation = {
  /**
   * Validate Ghana phone number
   * Supports formats: 0241234567, +233241234567, 233241234567
   */
  validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string; error?: string } {
    if (!phone || phone.trim() === '') {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove spaces and special characters
    const cleaned = phone.replace(/[\s\-()]/g, '');
    
    // Ghana phone number regex patterns
    const patterns = [
      /^0[2-9]\d{8}$/,           // 0241234567
      /^\+233[2-9]\d{8}$/,       // +233241234567
      /^233[2-9]\d{8}$/          // 233241234567
    ];

    const isValid = patterns.some(pattern => pattern.test(cleaned));

    if (!isValid) {
      return { 
        isValid: false, 
        error: 'Invalid Ghana phone number. Use format: 0241234567 or +233241234567' 
      };
    }

    // Format to standard format (0XX XXX XXXX)
    const formatted = this.formatPhoneNumber(cleaned);
    
    return { isValid: true, formatted };
  },

  /**
   * Format phone number to standard Ghana format
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-()+]/g, '');
    
    // Convert +233 or 233 to 0
    if (cleaned.startsWith('233')) {
      const localNumber = '0' + cleaned.substring(3);
      return `${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`;
    }
    
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
    
    return phone;
  },

  /**
   * Detect mobile network from phone number
   */
  detectMobileNetwork(phone: string): { network: string; isValid: boolean } {
    const cleaned = phone.replace(/[\s\-()+]/g, '');
    
    // Convert to local format (0XX...)
    let localNumber = cleaned;
    if (cleaned.startsWith('233')) {
      localNumber = '0' + cleaned.substring(3);
    }

    if (!localNumber.startsWith('0')) {
      return { network: 'Unknown', isValid: false };
    }

    const prefix = localNumber.substring(0, 3);
    
    const networks: Record<string, string> = {
      '024': 'MTN',
      '025': 'MTN',
      '054': 'MTN',
      '055': 'MTN',
      '059': 'MTN',
      '020': 'Vodafone',
      '050': 'Vodafone',
      '026': 'AirtelTigo',
      '023': 'AirtelTigo',
      '057': 'AirtelTigo',
      '027': 'MTN', // Historically MTN
      '028': 'MTN', // Historically MTN
      '056': 'Glo',
      '053': 'Glo',
    };

    return {
      network: networks[prefix] || 'Unknown',
      isValid: !!networks[prefix]
    };
  },

  /**
   * Validate GhanaPost GPS code
   * Format: AA-123-4567
   */
  validateGhanaPostGPS(gps: string): { isValid: boolean; error?: string } {
    if (!gps || gps.trim() === '') {
      return { isValid: true }; // Optional field
    }

    const cleaned = gps.trim().toUpperCase();
    const pattern = /^[A-Z]{3}-\d{3}-\d{4}$/;

    if (!pattern.test(cleaned)) {
      return { 
        isValid: false, 
        error: 'Invalid GhanaPost GPS code. Use format: AA-123-4567' 
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Ghana Card ID
   * Format: GHA-123456789-0
   */
  validateGhanaCardID(cardId: string): { isValid: boolean; error?: string } {
    if (!cardId || cardId.trim() === '') {
      return { isValid: false, error: 'Ghana Card ID is required' };
    }

    const cleaned = cardId.trim().toUpperCase();
    const pattern = /^GHA-\d{9}-\d{1}$/;

    if (!pattern.test(cleaned)) {
      return { 
        isValid: false, 
        error: 'Invalid Ghana Card ID. Use format: GHA-123456789-0' 
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Ghana regions
   */
  validateRegion(region: string): { isValid: boolean; error?: string } {
    const regions = [
      'Ashanti', 'Brong Ahafo', 'Central', 'Eastern', 'Greater Accra',
      'Northern', 'Upper East', 'Upper West', 'Volta', 'Western',
      'Ahafo', 'Bono East', 'North East', 'Oti', 'Savannah', 'Western North'
    ];

    if (!region || region.trim() === '') {
      return { isValid: false, error: 'Region is required' };
    }

    const isValid = regions.some(r => r.toLowerCase() === region.toLowerCase());

    if (!isValid) {
      return { 
        isValid: false, 
        error: 'Invalid Ghana region' 
      };
    }

    return { isValid: true };
  },

  /**
   * Get Ghana regions list
   */
  getRegions(): string[] {
    return [
      'Ashanti', 'Brong Ahafo', 'Central', 'Eastern', 'Greater Accra',
      'Northern', 'Upper East', 'Upper West', 'Volta', 'Western',
      'Ahafo', 'Bono East', 'North East', 'Oti', 'Savannah', 'Western North'
    ];
  },

  /**
   * Validate mobile money number (same as phone validation)
   */
  validateMobileMoneyNumber(phone: string): { isValid: boolean; formatted?: string; error?: string; network?: string } {
    const phoneValidation = this.validatePhoneNumber(phone);
    
    if (!phoneValidation.isValid) {
      return phoneValidation;
    }

    const networkDetection = this.detectMobileNetwork(phone);
    
    return {
      ...phoneValidation,
      network: networkDetection.network
    };
  }
};