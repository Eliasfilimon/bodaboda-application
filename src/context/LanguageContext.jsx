import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    requestRide: 'Request a Ride',
    history: 'History',
    profile: 'Profile',
    dashboard: 'Dashboard',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    phoneNumber: 'Phone Number',
    password: 'Password',
    name: 'Name',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Ride Request
    pickupLocation: 'Pickup Location',
    destination: 'Destination',
    whereTo: 'Where do you want to go?',
    selectDestination: 'Select Destination',
    availableRiders: 'Available Riders',
    suggestedRider: 'Suggested Rider (Nearest)',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    fareEstimate: 'Estimated Fare',
    baseFare: 'Base Fare',
    distanceCharge: 'Distance Charge',
    riderFee: 'Rider Fee',
    total: 'Total',
    confirmRide: 'Confirm Ride',
    cancel: 'Cancel',
    
    // Tracking
    trackRide: 'Track Your Ride',
    riderOnTheWay: 'Rider is on the way',
    arrived: 'Rider has arrived',
    inProgress: 'Trip in progress',
    contactRider: 'Contact Rider',
    call: 'Call',
    message: 'Message',
    shareTrip: 'Share Trip',
    emergency: 'Emergency',
    sos: 'SOS',
    
    // Status
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    online: 'Online',
    offline: 'Offline',
    
    // Ratings
    rateTrip: 'Rate Your Trip',
    howWasRide: 'How was your ride?',
    submit: 'Submit',
    skip: 'Skip',
    
    // Profile
    personalInfo: 'Personal Information',
    defaultLocation: 'Default Location',
    paymentMethods: 'Payment Methods',
    saveChanges: 'Save Changes',
    
    // Emergency
    emergencyContacts: 'Emergency Contacts',
    callPolice: 'Call Police',
    callAmbulance: 'Call Ambulance',
    shareLocation: 'Share My Location',
    emergencyAlertSent: 'Emergency alert sent!',
    
    // Errors
    noRidersAvailable: 'No riders available right now',
    locationError: 'Unable to get your location',
    networkError: 'Network connection error',
    
    // Success
    rideRequested: 'Ride requested successfully!',
    tripCompleted: 'Trip completed!',
    changesSaved: 'Changes saved successfully',
    
    // Misc
    loading: 'Loading...',
    retry: 'Retry',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    
    // Tanzania specific
    enterMpesaNumber: 'Enter M-Pesa Number',
    enterTigoNumber: 'Enter Tigo Pesa Number',
    enterAirtelNumber: 'Enter Airtel Money Number',
    priceNegotiation: 'Price Negotiation',
    proposedPrice: 'Proposed Price',
    accept: 'Accept',
    decline: 'Decline',
    counterOffer: 'Counter Offer',
    
    // Time
    now: 'Now',
    later: 'Later',
    minutes: 'minutes',
    hours: 'hours',
    arrivingIn: 'Arriving in',
    
    // Safety
    safetyTips: 'Safety Tips',
    shareWithFamily: 'Share trip details with family',
    verifyRider: 'Verify rider identity before starting',
    wearHelmet: 'Always wear a helmet',
    emergencyButton: 'Emergency button for urgent help',
  },
  sw: {
    // Navigation
    home: 'Nyumbani',
    requestRide: 'Omba Safari',
    history: 'Historia',
    profile: 'Wasifu',
    dashboard: 'Dashibodi',
    
    // Auth
    login: 'Ingia',
    register: 'Jisajili',
    logout: 'Toka',
    phoneNumber: 'Nambari ya Simu',
    password: 'Nenosiri',
    name: 'Jina',
    createAccount: 'Tengeneza Akaunti',
    alreadyHaveAccount: 'Tayari una akaunti?',
    dontHaveAccount: 'Huna akaunti?',
    
    // Ride Request
    pickupLocation: 'Eneo la Kuchukuliwa',
    destination: 'Kilele cha Safari',
    whereTo: 'Unataka kwenda wapi?',
    selectDestination: 'Chagua Kilele cha Safari',
    availableRiders: 'Wapanda Pikipiki Waliyopo',
    suggestedRider: 'Mpanda Pikipiki Anayopendekezwa (Mliye Karibu)',
    paymentMethod: 'Njia ya Malipo',
    cash: 'Fedha Taslimu',
    fareEstimate: 'Kadirio nauli',
    baseFare: 'Nauli Msingi',
    distanceCharge: 'Malipo ya Umbali',
    riderFee: 'Ada ya Mpanda Pikipiki',
    total: 'Jumla',
    confirmRide: 'Thibitisha Safari',
    cancel: 'Ghairi',
    
    // Tracking
    trackRide: 'Fuatilia Safari Yako',
    riderOnTheWay: 'Mpanda Pikipiki ana njiani',
    arrived: 'Mpanda Pikipiki amefika',
    inProgress: 'Safari inaendelea',
    contactRider: 'Wasiliana na Mpanda Pikipiki',
    call: 'Piga Simu',
    message: 'Tuma Ujumbe',
    shareTrip: 'Shiriki Safari',
    emergency: 'Dharura',
    sos: 'Msaada wa Haraka',
    
    // Status
    pending: 'Inasubiri',
    inProgress: 'Inaendelea',
    completed: 'Imekamilika',
    cancelled: 'Imeghairiwa',
    online: 'Mtandaoni',
    offline: 'Nje ya Mtandao',
    
    // Ratings
    rateTrip: 'Kadiria Safari Yako',
    howWasRide: 'Safari yako ilikuwaje?',
    submit: 'Wasiliana',
    skip: 'Ruka',
    
    // Profile
    personalInfo: 'Taarifa za Kibinafsi',
    defaultLocation: 'Eneo la Chaguo',
    paymentMethods: 'Njia za Malipo',
    saveChanges: 'Hifadhi Mabadiliko',
    
    // Emergency
    emergencyContacts: 'Mawasiliano ya Dharura',
    callPolice: 'Piga Polisi',
    callAmbulance: 'Piga Ambulance',
    shareLocation: 'Shiriki Mahali Nipo',
    emergencyAlertSent: 'Tahadhari ya dharura imetumwa!',
    
    // Errors
    noRidersAvailable: 'Hakuna wapanda pikipiki kwa sasa',
    locationError: 'Imeshindwa kupata mahali ulipo',
    networkError: 'Hitilafu ya muunganiko wa mtandao',
    
    // Success
    rideRequested: 'Safari imeombwa kwa mafanikio!',
    tripCompleted: 'Safari imekamilika!',
    changesSaved: 'Mabadiliko yamehifadhiwa',
    
    // Misc
    loading: 'Inapakia...',
    retry: 'Jaribu Tena',
    close: 'Funga',
    yes: 'Ndiyo',
    no: 'Hapana',
    back: 'Rudi',
    next: 'Endelea',
    done: 'Maliza',
    
    // Tanzania specific
    enterMpesaNumber: 'Weka Nambari ya M-Pesa',
    enterTigoNumber: 'Weka Nambari ya Tigo Pesa',
    enterAirtelNumber: 'Weka Nambari ya Airtel Money',
    priceNegotiation: 'Mazungumzo ya Bei',
    proposedPrice: 'Bei Iliyopendekezwa',
    accept: 'Kubali',
    decline: 'Kataa',
    counterOffer: 'Bei Mbadala',
    
    // Time
    now: 'Sasa',
    later: 'Baadae',
    minutes: 'dakika',
    hours: 'masaa',
    arrivingIn: 'Anafika katika',
    
    // Safety
    safetyTips: 'Vidokezo vya Usalama',
    shareWithFamily: 'Shiriki maelezo ya safari na familia',
    verifyRider: 'Thibitisha utambulisho wa mpanda pikipiki',
    wearHelmet: 'Vaa chapeo kila wakati',
    emergencyButton: 'Kitufe cha dharura kwa msaada wa haraka',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'sw'; // Default to Swahili for Tanzania
  });

  const t = useCallback((key) => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  }, [language]);

  const setLang = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
