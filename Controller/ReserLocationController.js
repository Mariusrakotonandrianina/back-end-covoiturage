const ReserLocation = require("../model/ReserLocation.js");
const Location = require("../model/Location.js");

async function generateNumber() {
  const reservationCount = await ReserLocation.countDocuments();
  const nextNumber = (reservationCount + 1).toString().padStart(5, "0");
  return `A${nextNumber}`;
}

exports.Payment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const amountInCents = amount * 100;

    const stripe = req.app.locals.stripe;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "USD",
      payment_method: paymentMethod,
      confirmation_method: "manual",
      confirm: true,
      return_url: "http://localhost:3004/ReservationPage/Location",
    });

    const clientEmail = paymentIntent?.charges?.data[0]?.billing_details?.email;

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Erreur lors du traitement du paiement" });
  }
};

exports.createReserLocation = async (req, res) => {
  try {
    const {
      nom,
      email,
      location,
      frais,
      utilisation,
      paymentMethod,
      dateReserver,
      immatriculation,
      dateRecuperation,
    } = req.body;

    if (!location) {
      return res
        .status(400)
        .json({ error: "Aucun trajet trouvé avec les codes fournis" });
    }

    const codeReser = await generateNumber();

    const dateReserverObj = new Date(dateReserver);
    const dateRecuperationObj = new Date(dateRecuperation);

    if (isNaN(dateReserverObj) || isNaN(dateRecuperationObj)) {
      return res.status(400).json({ error: "Format de date invalide" });
    }

    const existingReservations = await ReserLocation.find({
      location,
      $or: [
        {
          dateReserver: { $lte: dateRecuperationObj, $gte: dateReserverObj },
        },
        {
          dateRecuperation: {
            $gte: dateReserverObj,
            $lte: dateRecuperationObj,
          },
        },
        {
          dateReserver: { $lte: dateReserverObj },
          dateRecuperation: { $gte: dateRecuperationObj },
        },
      ],
    });

    if (existingReservations.length > 0) {
      return res
        .status(400)
        .json({ error: "La date est déjà réservée pour ce véhicule" });
    }

    const reservation = new ReserLocation({
      codeReser,
      nom,
      email,
      location,
      frais,
      utilisation,
      paymentMethod,
      dateReser: new Date(),
      dateReserver: dateReserverObj,
      dateRecuperation: dateRecuperationObj,
      immatriculation,
    });

    const savedReser = await reservation.save();

    res.status(201).json({ savedReser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'enregistrement de la réservation" });
  }
};

exports.getReserLocation = async (req, res) => {
  try {
    const reservations = await ReserLocation.find()
      .populate("location")
      .sort({ dateReser: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des réservations" });
  }
};

exports.updateReserLocation = async (req, res) => {
  try {
    const {
      nom,
      email,
      immatriculation,
      frais,
      utilisation,
      paymentMethod,
      dateReserver,
      nbJours,
    } = req.body;

    const reservation = await ReserLocation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    const location = await Location.findOne({ immatriculation });
    console.log(location);
    if (!location) {
      return res.status(400).json({ error: "Aucun véhicule trouvé avec cette immatriculation" });
    }

    const dateReserverObj = new Date(dateReserver);
    const dateRecuperationObj = new Date(dateReserverObj);
    dateRecuperationObj.setDate(dateRecuperationObj.getDate() + parseInt(nbJours));

    const existingReservations = await ReserLocation.find({
      _id: { $ne: req.params.id },
      location: location._id,
      $or: [
        { dateReserver: { $lte: dateRecuperationObj, $gte: dateReserverObj } },
        { dateRecuperation: { $gte: dateReserverObj, $lte: dateRecuperationObj } },
        { dateReserver: { $lte: dateReserverObj }, dateRecuperation: { $gte: dateRecuperationObj } },
      ],
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({ error: "La date est déjà réservée pour ce véhicule" });
    }

    reservation.nom = nom;
    reservation.email = email;
    reservation.location = location._id;
    reservation.frais = frais;
    reservation.utilisation = utilisation;
    reservation.paymentMethod = paymentMethod;
    reservation.dateReserver = dateReserverObj;
    reservation.dateRecuperation = dateRecuperationObj;
    reservation.dateReser = new Date();

    const updatedReservation = await reservation.save();

    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la réservation" });
  }
};

exports.deleteReserLocation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservationToDelete = await ReserLocation.findById(reservationId);

    if (!reservationToDelete) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    await ReserLocation.findByIdAndDelete(reservationId);

    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la réservation" });
  }
};

exports.searchReserLocation = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const locationQuery = {
      $or: [
        { immatriculation: regex },
        { numSerie: regex },
        { marque: regex },
        { utilisation: regex }
      ]
    };
    const locationIds = await Location.find(locationQuery, "_id");

    let dateQuery = {};
    const parts = searchTerm.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day + 1);
        endDate.setMilliseconds(endDate.getMilliseconds() - 1);

        dateQuery = {
          $or: [
            {
              dateReserver: {
                $gte: startDate,
                $lt: endDate
              }
            },
            {
              dateRecuperation: {
                $gte: startDate,
                $lt: endDate
              }
            },
            {
              dateReser: {
                $gte: startDate,
                $lt: endDate
              }
            }
          ]
        };
      }
    }

    const query = {
      $or: [
        { codeReser: regex },
        { nom: regex },
        { email: regex },
        { paymentMethod: regex },
        { utilisation: regex },
        { location: { $in: locationIds } }
      ],
      ...dateQuery
    };

    const reservations = await ReserLocation.find(query).populate({
      path: "location",
    });

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la recherche des réservations",
    });
  }
};

exports.getReserLocationByUser = async (req, res) => {
  try {
    const userEmail = req.query.userEmail;

    if (!userEmail) {
      return res.status(400).json({ error: "Email de l'utilisateur manquant" });
    }

    const reservations = await ReserLocation.find({ email: userEmail })
      .populate("location")
      .sort({ dateReser: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération des réservations de l'utilisateur",
    });
  }
};

exports.getReservedDates = async (req, res) => {
  try {
    const { locationId } = req.query;

    if (!locationId) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    const reservations = await ReserLocation.find({
      location: locationId,
    }).select("dateReserver dateRecuperation -_id");

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des dates réservées" });
  }
};
