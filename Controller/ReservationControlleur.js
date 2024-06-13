const Reservation = require("../model/Reservation.js");
const Trajet = require("../model/Trajet.js");

async function generateNumber() {
  const reservationCount = await Reservation.countDocuments();
  const nextNumber = (reservationCount + 1).toString().padStart(5, "0");
  return `A${nextNumber}`;
}

exports.processPayment = async (req, res) => {
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
      return_url: "http://localhost:3004/Trajet/MesTrajets",
    });

    const clientEmail = paymentIntent?.charges?.data[0]?.billing_details?.email;

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Erreur lors du traitement du paiement" });
  }
};

exports.saveReservation = async (req, res) => {
  try {
    const {
      nom,
      email,
      trajet,
      frais,
      paymentMethod,
      nbPlaceReserver,
      numPlace,
      immatriculation,
    } = req.body;

    const trajets = await Trajet.find(
      { codeTrajet: { $in: trajet } },
      "_id nbPlace"
    );

    if (trajets.length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun trajet trouvé avec les codes fournis" });
    }

    for (const trajet of trajets) {
      if (nbPlaceReserver > trajet.nbPlace) {
        return res.status(400).json({
          error:
            "Nombre de places insuffisant pour le trajet " + trajet.codeTrajet,
        });
      }
    }

    for (const trajet of trajets) {
      trajet.nbPlace -= nbPlaceReserver;
      await trajet.save();
    }

    const codeReser = await generateNumber();
    const fraisPayer = nbPlaceReserver * frais;

    const reservation = new Reservation({
      codeReser,
      nom,
      email,
      trajet: trajets.map((trajet) => trajet._id),
      frais,
      paymentMethod,
      dateReser: new Date(),
      nbPlaceReserver,
      numPlace,
      fraisPayer,
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

exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate({
        path: "trajet",
        populate: [{ path: "cooperative" }, { path: "vehicule" }],
      })
      .sort({ dateReser: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des réservations" });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const {
      nom,
      email,
      telephone,
      trajet,
      frais,
      paymentMethod,
      nbPlaceReserver,
    } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    const trajets = await Trajet.find(
      { codeTrajet: { $in: trajet } },
      "_id nbPlace"
    );
    if (trajets.length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun trajet trouvé avec les codes fournis" });
    }

    const differenceNbPlacesReservees =
      nbPlaceReserver - reservation.nbPlaceReserver;

    for (const trajet of trajets) {
      const newNbPlacesDisponibles =
        trajet.nbPlace + (reservation.nbPlaceReserver - nbPlaceReserver);
      if (newNbPlacesDisponibles < 0) {
        return res.status(400).json({
          error:
            "Nombre de places insuffisant pour le trajet " + trajet.codeTrajet,
        });
      }
      trajet.nbPlace = newNbPlacesDisponibles;
      await trajet.save();
    }

    reservation.nom = nom;
    reservation.email = email;
    reservation.telephone = telephone;
    reservation.trajet = trajets.map((trajet) => trajet._id);
    reservation.frais = frais;
    reservation.paymentMethod = paymentMethod;
    reservation.nbPlaceReserver = nbPlaceReserver;
    reservation.fraisPayer = nbPlaceReserver * frais;

    const updatedReservation = await reservation.save();

    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la réservation" });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservationToDelete = await Reservation.findById(reservationId);

    if (!reservationToDelete) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    const nbPlacesReservees = reservationToDelete.nbPlaceReserver;

    const trajetId = reservationToDelete.trajet;

    const trajet = await Trajet.findById(trajetId);
    trajet.nbPlace += nbPlacesReservees; // Ajouter le nombre de places réservées
    await trajet.save();

    await Reservation.findByIdAndDelete(reservationId);

    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la réservation" });
  }
};

exports.searchReservation = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const trajetIds = await Trajet.find({ codeTrajet: regex }, "_id");

    let dateQuery = {};
    const parts = searchTerm.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        dateQuery = { dateTrajet: new Date(year, month - 1, day) };
      }
    } else if (parts.length === 2) {
      const [month, day] = parts.map(Number);
      if (!isNaN(month) && !isNaN(day)) {
        dateQuery = {
          $or: [
            { $expr: { $eq: [{ $month: "$dateTrajet" }, month] } },
            { $expr: { $eq: [{ $dayOfMonth: "$dateTrajet" }, day] } },
          ],
        };
      }
    } else if (parts.length === 1) {
      const year = Number(searchTerm);
      if (!isNaN(year)) {
        dateQuery = {
          $expr: {
            $eq: [{ $year: "$dateTrajet" }, year],
          },
        };
      }
    }

    let query = {
      $or: [
        { codeReser: regex },
        { nom: regex },
        { email: regex },
        { telephone: regex },
        { trajet: { $in: trajetIds } },
      ],
    };

    if (Object.keys(dateQuery).length > 0) {
      query.$and = [{ $or: [dateQuery] }];
    }

    const reservations = await Reservation.find(query).populate({
      path: "trajet",
      populate: [
        { path: "cooperative", match: { numCoop: regex } },
        { path: "vehicule", match: { immatriculation: regex } },
      ],
      match: {
        $or: [{ codeTrajet: regex }, dateQuery],
      },
    });

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la recherche des réservations",
    });
  }
};

exports.getReservedPlaces = async (req, res) => {
  try {
    const trajetId = req.query.trajetId;

    if (!trajetId) {
      return res.status(400).json({ error: "ID de trajet manquant" });
    }

    const reservations = await Reservation.find({ trajet: trajetId });

    const reservedPlaces = reservations.reduce((acc, curr) => {
      acc.push(...curr.numPlace);
      return acc;
    }, []);

    res.status(200).json({ reservedPlaces });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des places réservées" });
  }
};

exports.getReservationsByUser = async (req, res) => {
  try {
    const userEmail = req.query.userEmail;

    if (!userEmail) {
      return res.status(400).json({ error: "Email de l'utilisateur manquant" });
    }

    const reservations = await Reservation.find({ email: userEmail })
      .populate({
        path: "trajet",
        populate: [
          { path: "cooperative" },
          { path: "vehicule", populate: [{ path: "conducteur" }, { path: "bus" }] },
        ],
      })
      .sort({ dateReser: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération des réservations de l'utilisateur",
    });
  }
};
