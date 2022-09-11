async function checkAuthorization(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    let db = await mongo();
    const session = await db.collection("sessions").findOne({ token });

    if (!session) {
      return res.status(401).send({ message: "O usuário não está logado" });
    }
    res.locals.session = session;
    next();
  } catch (error) {
    return res.send(500);
  }
}

export default checkAuthorization;
