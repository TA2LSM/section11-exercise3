// auth middleware kısmı bize req.user objesini oluşturuyor.
// buradaki middleware auth middlewaree'inden sonra çalışacak.
// dolayısıyla req.user.isAdmin tanımlı olacak.
module.exports = function (req, res, next) {
  // http 401 kodu "unauthorized" demek. (yetkisiz) erişim doğru yapılmadığında
  // http 403 kodu "forbidden" demek. (yasaklı, izin verilmeyen) erişim doğru ama yetki geçersiz ise
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");
  next(); // route handler'a işlemi devret
};
