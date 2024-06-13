const express = require("express");
const {
  createConducteur,
  getConducteur,
  deleteConducteur,
  updConducteur,
  conducteurLogin,
  searchConducteur,
  checkConducteurUsage,
} = require("../Controller/ConducteurController");
const {
  createRoute,
  getRoute,
  deleteRoute,
  updRoute,
  searchRoute,
} = require("../Controller/RouteController");
const {
  createSecteur,
  getSecteur,
  deleteSecteur,
  updSecteur,
  searchSecteur,
  checkSecteurUsage,
} = require("../Controller/SecteurController");
const {
  createVehicule,
  getVehicule,
  deleteVehicule,
  updVehicule,
  searchVehicule,
  checkVehiculeUsage,
} = require("../Controller/VehiculeController");
const {
  createAdmin,
  getAdmin,
  deleteAdmin,
  updAdmin,
  adminLogin,
} = require("../Controller/AdminController");
const {
  createUtilisateur,
  utilisateurLogin,
  getUtilisateur,
  deleteUtilisateur,
  updUtilisateur,
  searchUtilisateur,
} = require("../Controller/UtilisateurController");
const {
  createBusCoop,
  getBusCoop,
  deleteBusCoop,
  updBusCoop,
  searchBusCoop,
  checkCooperativeUsage,
} = require("../Controller/BusCoopContoller");
const {
  createBusReg,
  getBusReg,
  deleteBusReg,
  updBusReg,
  searchBusReg,
} = require("../Controller/BusRegController");
const {
  createProprietaire,
  getProprietaire,
  deleteProprietaire,
  updProprietaire,
  searchProprietaire,
} = require("../Controller/ProprietaireController");
const {
  createTrajet,
  getTrajet,
  deleteTrajet,
  updTrajet,
  searchTrajet,
  getTrajetsDisponibles,
} = require("../Controller/TrajetController");

const {
  processPayment,
  saveReservation,
  getReservations,
  updateReservation,
  deleteReservation,
  searchReservation,
  getReservedPlaces,
  getReservationsByUser,
} = require("../Controller/ReservationControlleur");

const {
  createLocation,
  getLocation,
  deleteLocation,
  updLocation,
  searchLocation,
  checkLocationUsage,
} = require("../Controller/LocationSpecialController");

const {
  Payment,
  createReserLocation,
  getReserLocation,
  updateReserLocation,
  deleteReserLocation,
  searchReserLocation,
  getReserLocationByUser,
  getReservedDates,
} = require("../Controller/ReserLocationController");

const imagesUpload = require("../middleware/upload")

const router = express.Router();

router.post("/createConducteur", createConducteur); //conducteur
router.post("/conducteurLogin", conducteurLogin);
router.get("/getConducteur", getConducteur);
router.delete("/delConducteur/:id", deleteConducteur);
router.put("/updConducteur/:id", updConducteur);
router.get("/searchConducteur", searchConducteur);
router.get("/checkConducteurUsage/:id", checkConducteurUsage);
router.post("/createRoute", createRoute); //Route
router.get("/getRoute", getRoute);
router.delete("/delRoute/:id", deleteRoute);
router.put("/updRoute/:id", updRoute);
router.get("/searchRoute", searchRoute);
router.post("/createSecteur", createSecteur); //Secteur
router.get("/getSecteur", getSecteur);
router.delete("/delSecteur/:id", deleteSecteur);
router.put("/updSecteur/:id", updSecteur);
router.get("/searchSecteur", searchSecteur);
router.get("/checkSecteurUsage/:id", checkSecteurUsage);
router.post("/createVehicule", createVehicule); //Vehicule
router.get("/getVehicule", getVehicule);
router.delete("/delVehicule/:id", deleteVehicule);
router.put("/updVehicule/:id", updVehicule);
router.get("/searchVehicule", searchVehicule);
router.get("/checkVehiculeUsage/:id", checkVehiculeUsage);
router.post("/createAdmin", createAdmin); //Admin
router.post("/adminLogin", adminLogin);
router.get("/getAdmin", getAdmin);
router.delete("/delAdmin/:id", deleteAdmin);
router.put("/updAdmin/:id", updAdmin);
router.post("/createUtilisateur", createUtilisateur); //Utilisateur
router.post("/utilisateurLogin", utilisateurLogin);
router.get("/getUtilisateur", getUtilisateur);
router.delete("/delUtilisateur/:id", deleteUtilisateur);
router.put("/updUtilisateur/:id", updUtilisateur);
router.get("/searchUtilisateur", searchUtilisateur);
router.post("/createBusCoop", createBusCoop); //Cooperative
router.get("/getBusCoop", getBusCoop);
router.put("/updBusCoop/:id", updBusCoop);
router.delete("/delBusCoop/:id", deleteBusCoop);
router.get("/searchBusCoop", searchBusCoop);
router.get("/checkCooperativeUsage/:id", checkCooperativeUsage);
router.post("/createBusReg", createBusReg); //busRegistre
router.get("/getBusReg", getBusReg);
router.delete("/delBusReg/:id", deleteBusReg);
router.put("/updBusReg/:id", updBusReg);
router.get("/searchBusReg", searchBusReg);
router.post("/createProp", createProprietaire); //Proprietaire
router.get("/getProp", getProprietaire);
router.delete("/delProp/:id", deleteProprietaire);
router.put("/updProp/:id", updProprietaire);
router.get("/searchProprietaire", searchProprietaire);
router.post("/createTrajet", createTrajet); //Trajet
router.get("/getTrajet", getTrajet);
router.put("/updTrajet/:id", updTrajet);
router.delete("/deleteTrajet/:id", deleteTrajet);
router.get("/searchTrajet", searchTrajet);
router.get("/getTrajetDisponible", getTrajetsDisponibles);
router.post("/createReservation", saveReservation); //Reservation
router.post("/processPayment", processPayment);
router.put("/updateReservation/:id", updateReservation);
router.get("/getReservation", getReservations);
router.delete("/deleteReservation/:id", deleteReservation);
router.get("/searchReservation", searchReservation);
router.get("/reservedPlaces", getReservedPlaces);
router.get("/getReservationsByUser", getReservationsByUser);
router.post("/createLocation", imagesUpload, createLocation);//Location
router.get("/getLocation", getLocation);
router.delete("/deleteLocation/:id", deleteLocation);
router.put("/updLocation/:id", imagesUpload, updLocation);
router.get("/searchLocation", searchLocation);
router.get("/checkLocationUsage/:id", checkLocationUsage);
router.post("/Payment", Payment); //ReserLocation
router.post("/createReserLocation", createReserLocation);
router.get("/getReserLocation", getReserLocation);
router.put("/updateReserLocation", updateReserLocation);
router.delete("/deleteReserLocation/:id", deleteReserLocation);
router.get("/searchReserLocation", searchReserLocation);
router.get("/getReserLocationByUser", getReserLocationByUser);
router.get("/getReservedDates", getReservedDates);


module.exports = router;
