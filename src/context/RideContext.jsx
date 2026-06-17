/* eslint-disable react-refresh/only-export-components */
import { createContext, useReducer } from "react";
import {
  riders as initialRiders,
  trips as initialTrips,
  currentUser,
  locationCoordinates,
} from "../data/mockData";

export const RideContext = createContext();

const initialState = {
  trips: initialTrips.map((trip) => ({ ...trip })),
  riders: initialRiders.map((rider) => ({ ...rider })),
  activeTripId: null,
  currentUser: currentUser,
};

const rideReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TRIP": {
      const newTrip = { ...action.payload, status: "pending" };
      const onlineRiders = state.riders.filter((r) => r.status === "online");
      const pickupCoords = locationCoordinates[newTrip.pickup];
      if (onlineRiders.length > 0) {
        const nearest = pickupCoords
          ? onlineRiders
              .map((rider) => {
                const riderCoords = locationCoordinates[rider.location];
                if (!riderCoords) return { rider, distance: Number.POSITIVE_INFINITY };
                const dx = pickupCoords[0] - riderCoords[0];
                const dy = pickupCoords[1] - riderCoords[1];
                return { rider, distance: dx * dx + dy * dy };
              })
              .sort((a, b) => a.distance - b.distance)[0]?.rider
          : onlineRiders[0];
        newTrip.rider = nearest?.name || null;
      }
      return {
        ...state,
        trips: [...state.trips, newTrip],
        activeTripId: newTrip.id,
      };
    }
    case "SET_ACTIVE_TRIP": {
      return {
        ...state,
        activeTripId: action.payload,
      };
    }
    case "SET_USER": {
      return {
        ...state,
        currentUser: action.payload,
      };
    }
    case "UPDATE_USER": {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...action.payload,
        },
      };
    }
    case "ACCEPT_TRIP": {
      const { tripId, riderId } = action.payload;
      const rider = state.riders.find((r) => r.id === riderId);
      const updatedTrips = state.trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, status: "in_progress", rider: rider?.name || trip.rider }
          : trip
      );
      const updatedRiders = state.riders.map((riderItem) =>
        riderItem.id === riderId ? { ...riderItem, status: "on_trip" } : riderItem
      );
      return {
        ...state,
        trips: updatedTrips,
        riders: updatedRiders,
      };
    }
    case "COMPLETE_TRIP": {
      const { tripId, riderId } = action.payload;
      const updatedTrips = state.trips.map((trip) =>
        trip.id === tripId ? { ...trip, status: "completed" } : trip
      );
      const updatedRiders = state.riders.map((rider) =>
        rider.id === riderId ? { ...rider, status: "online" } : rider
      );
      return {
        ...state,
        trips: updatedTrips,
        riders: updatedRiders,
      };
    }
    default:
      return state;
  }
};

export const RideProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rideReducer, initialState);

  const addTrip = (trip) => {
    dispatch({ type: "ADD_TRIP", payload: trip });
  };

  const setActiveTripId = (tripId) => {
    dispatch({ type: "SET_ACTIVE_TRIP", payload: tripId });
  };

  const registerUser = (user) => {
    dispatch({ type: "SET_USER", payload: user });
  };

  const signInWithGoogle = () => {
    const user = {
      id: Date.now(),
      name: "Google User",
      phone: "+255 700 000 000",
      defaultLocation: "Dodoma CBD",
      paymentMethods: [],
      provider: "google",
    };
    dispatch({ type: "SET_USER", payload: user });
  };

  const updateUser = (userPatch) => {
    dispatch({ type: "UPDATE_USER", payload: userPatch });
  };

  const acceptTrip = (tripId, riderId) => {
    dispatch({ type: "ACCEPT_TRIP", payload: { tripId, riderId } });
  };

  const completeTrip = (tripId, riderId) => {
    dispatch({ type: "COMPLETE_TRIP", payload: { tripId, riderId } });
  };

  const value = {
    trips: state.trips,
    riders: state.riders,
    currentUser: state.currentUser,
    activeTripId: state.activeTripId,
    addTrip,
    setActiveTripId,
    registerUser,
    signInWithGoogle,
    updateUser,
    acceptTrip,
    completeTrip,
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};
