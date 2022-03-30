//const winston = require("winston");

// Aşağıdaki kısım mecburen değiştirildi. logger'ı parametre olarak alan
// ve işi bitince geriye 4 parametre alan bir fonksiyon dönen hale çevrildi.
module.exports = function (logger) {
  return function (err, req, res, next) {
    // Burada hatayı kaydetmemiz de lazım. Sonra cevap dönmeliyiz.
    // Kaydedilecek en önemli hata kısımları:
    // error (0), warn, info, http, verbose, debug, silly (6)

    // parametre olarak: error level
    //winston.log("error", err.message); // YA DA aşağıdaki gibi:
    //winston.error(err.message);

    // "err" burada "metadata"dır. İçindeki tüm detayları da log'lamış oluyoruz.
    // Kurstaki aşağıdaki yöntem artık geçersiz.
    //winston.error(err.message, err);

    //logger.error(err.message, err);
    logger.error(err.message, { metadata: err }); // mongdb'de "meta" alanı boş çıkmasın diye "metadata" eklendi
    //logger.log("error", err.message);
    res.status(500).send("Internal server error"); // Internal server error
  };
};
