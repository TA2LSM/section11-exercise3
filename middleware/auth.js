const jwt = require("jsonwebtoken");
const config = require("config");

// middleware fonksiyonlarında 3. parametre olarak next kullanılması gerekiyor.
// res.send ile ya da return ile geri dönülür. next() ile bir sonraki işleme ya da middleware
// fonksiyonuna işlem devredilir.
function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied! No token provided.");

  // jwt.verify metodu token'dan decode edilmiş bir payload döner ama token
  // geçerli bir token değilse hata üretir. Bu nedenle "try-catch" bloğu kullanmak gerekiyor.
  try {
    const decodedPayload = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decodedPayload; // bu şekilde token'dan decode edilen "user._id" verisine erişilebilir
    next();
  } catch (ex) {
    res.status(400).send("Unauthorized access! Invalid token.");
  }
}

module.exports = auth;

// module.exports = function (req, res, next) {...} şeklinde de direkt yazılabilir.
// Bu durumda sondaki "module.exports = auth;" kullanılmayacak.
