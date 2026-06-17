export const riders = [
  { id: 1, name: "Juma Hassan",    phone: "+255 712 345 678", rating: 4.8, trips: 142, status: "online",  location: "Jakaya Kikwete Road" },
  { id: 2, name: "Baraka Mwita",   phone: "+255 754 987 321", rating: 4.6, trips: 98,  status: "on_trip", location: "Mlimwa Estate" },
  { id: 3, name: "Salim Abdallah", phone: "+255 768 111 222", rating: 4.9, trips: 210, status: "offline", location: "UDOM Campus" },
  { id: 4, name: "Grace Mtembe",   phone: "+255 743 555 888", rating: 4.7, trips: 76,  status: "online",  location: "Dodoma CBD" },
];

export const currentUser = null;

export const trips = [
  { id: 1, customer: "Elias F.",   pickup: "Jakaya Kikwete Road", dropoff: "Dodoma CBD Market", fare: 1760, status: "completed", rider: "Juma Hassan",    time: "08:15 AM", payment: "M-Pesa"   },
  { id: 2, customer: "Amina S.",   pickup: "UDOM Campus",       dropoff: "Jamhuri Stadium",   fare: 2100, status: "in_progress", rider: "Baraka Mwita", time: "09:42 AM", payment: "Cash"     },
  { id: 3, customer: "David M.",   pickup: "Mlimwa Estate",     dropoff: "Makole Market",     fare: 1400, status: "pending",    rider: null,           time: "10:05 AM", payment: "Tigo Pesa"},
  { id: 4, customer: "Fatuma K.",  pickup: "Chang'ombe",        dropoff: "Dodoma CBD",        fare: 1600, status: "completed", rider: "Grace Mtembe", time: "07:30 AM", payment: "Airtel"   },
  { id: 5, customer: "Hassan N.",  pickup: "Ipagala",           dropoff: "UDOM Campus",       fare: 2500, status: "pending",    rider: null,           time: "10:20 AM", payment: "M-Pesa"   },
];

export const dodoma_locations = [
  "Dodoma CBD", "Jakaya Kikwete Road", "Mlimwa Estate", "UDOM Campus",
  "Jamhuri Stadium", "Chang'ombe", "Makole Market", "Ipagala",
  "Uhuru Street", "Nyerere Road", "Kikuyu Area", "Railway Station"
];

export const locationCoordinates = {
  "Dodoma CBD": [-6.1722, 35.7395],
  "Jakaya Kikwete Road": [-6.1800, 35.7400],
  "Mlimwa Estate": [-6.1650, 35.7350],
  "UDOM Campus": [-6.1900, 35.7500],
  "Jamhuri Stadium": [-6.1600, 35.7300],
  "Chang'ombe": [-6.2000, 35.7200],
  "Makole Market": [-6.1550, 35.7450],
  "Ipagala": [-6.1750, 35.7550],
  "Uhuru Street": [-6.1680, 35.7420],
  "Nyerere Road": [-6.1820, 35.7380],
  "Kikuyu Area": [-6.1520, 35.7480],
  "Railway Station": [-6.1700, 35.7250]
};

export const getDistance = (location1, location2) => {
  const distances = {
    "Dodoma CBD": { "Jakaya Kikwete Road": 1.2, "Mlimwa Estate": 1.8, "UDOM Campus": 3.5, "Jamhuri Stadium": 0.8, "Chang'ombe": 2.1, "Makole Market": 0.9, "Ipagala": 2.3, "Uhuru Street": 0.5, "Nyerere Road": 1.5, "Kikuyu Area": 1.1, "Railway Station": 1.9 },
    "Jakaya Kikwete Road": { "Dodoma CBD": 1.2, "Mlimwa Estate": 2.0, "UDOM Campus": 2.5, "Jamhuri Stadium": 1.8, "Chang'ombe": 3.2, "Makole Market": 1.9, "Ipagala": 1.5, "Uhuru Street": 1.1, "Nyerere Road": 0.7, "Kikuyu Area": 2.2, "Railway Station": 2.8 },
    "Mlimwa Estate": { "Dodoma CBD": 1.8, "Jakaya Kikwete Road": 2.0, "UDOM Campus": 2.3, "Jamhuri Stadium": 2.5, "Chang'ombe": 1.5, "Makole Market": 1.2, "Ipagala": 3.1, "Uhuru Street": 2.1, "Nyerere Road": 2.4, "Kikuyu Area": 0.9, "Railway Station": 2.7 }
  };

  const loc1Distances = distances[location1];
  if (loc1Distances && loc1Distances[location2]) {
    return loc1Distances[location2];
  }

  return Math.random() * 6.5 + 1.5;
};
