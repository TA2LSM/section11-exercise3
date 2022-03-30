// Aşağıdaki tanımlama MUTLAKA "routes" tanımlamalarının üstünde olmalı. Yoksa çalışmıyor !!!
require("express-async-errors"); // bunun dönüşünü alıp bir yerde tutmaya gerek YOKTUR.
const express = require("express");

// winston modülünden alınan (... require("winston")) default logger
// objesi olarak winston (const winston = ...) seçildi.
// Uygulama çok büyük ve karmaşıksa elle logger tanımlamak gerekebilir.
// Aşağıdaki yöntem orta ve küçük boyutlu uygulamalar için yeterli.
const winston = require("winston");
require("winston-mongodb"); // bunun dönüşünü alıp bir yerde tutmaya gerek YOKTUR.

const config = require("config");
const mongoose = require("mongoose");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// Bu modül, Joi modülüne yeni bir metot (fonksiyon) ekliyor aslında.

const dbPath = "mongodb://localhost/vidly";

const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/users");
const auth = require("./routes/auth");

const app = express();

// Kurstaki bu yöntem artık geçersiz.
//winston.add(winston.transports.File, { filename: "logfile.log" });
// Yerine aşağıdaki yöntem kullanıldı. "error.js"de de değişiklikler var !!!
const logger = winston.createLogger({
  transports: [
    //new winston.transports.Console(),
    new winston.transports.File({ filename: "./logs/combined.log", level: "info" }),
    new winston.transports.MongoDB({ db: dbPath, level: "error" }),
    // normalde hatalar ayrı bir db'de tutulmalı. Burada test amaçlı aynı db kullanıldı !!!
    // level kısmı baştan itibaren kaçıncı seviye mesajlara kadarının kaydedileceğidir.
    // Örneği info(2) için error, warning ve info mesajları kaydedilir. Sıralama için error.js'e
    // bakınız...
    new winston.transports.File({
      filename: "./logs/exceptionErrors.log",
      level: "error",
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  // exceptionHandlers: [new winston.transports.File({ filename: "./logs/exceptionErrors.log" })],
  // rejectionHandlers: [new winston.transports.File({ filename: "./logs/rejectiontionErrors.log" })],
}); // hem konsola hem de dosyaya yazacak...

// buraya parametre olarak (logger) eklendi. error.js artık logger'a erişebilir !!!
const error = require("./middleware/error")(logger);

//------------------------------------------------------------------------------------------
// Bu yöntem SADECE SENKRON KOD AKIŞINDA çalışır. Promise rejection'ları YAKALAMAZ !!!
process.on("uncaughtException", (ex) => {
  //console.log("WE GOT AN UNCAUGHT EXCEPTION");
  logger.error(ex.message, { metadata: ex }); // kurstakinden farklı yazmak zorunda kaldık...
  // kursta process göçmüyor demiş ama burada göçüyor...
  //process.exit(1); //yukarıdaki işlem bitmeden uygulama sonlandırıldığı için log tutmuyor !!!
});

process.on("unhandledRejection", (ex) => {
  //console.log("WE GOT AN UNHANDLED REJECTION");
  logger.error(ex.message, { metadata: ex }); // kurstakinden farklı yazmak zorunda kaldık...
  //process.exit(1); //yukarıdaki işlem bitmeden uygulama sonlandırıldığı için log tutmuyor !!!

  // burada oluşan hatayı fırlatsak bu hata rejection formatından exception formatına değişir
  // ve bunu yakalayan bir kod parçası varsa orada log'lanabilir.
  // throw ex;
});
// Bu noktada uygulama tahmin edilemeyen bir noktada olabilir. (unclean) En iyi yaklaşım
// uygulamayı sonlandırmaktır. Yeniden başlatmak için process manager'lar var (pm2 gibi
// muhtemelen) bunlar uygulamayı tekrar başlatabiliyor.
//------------------------------------------------------------------------------------------

// Aşağıdaki error express işleyişinin dışında ve log'lanmayacaktır.
// yukarıdaki process.on() kod öbeği sayesinde log'lanabilir. Hata yukarıdaki
// koddan önce oluşursa yine log'lanamayacaktır !!!
// Senkron işleyişi olan kod hatası yaratıldı
//throw new Error("Something failed during startup!");

// Promise rejection hatası yaratalım. Sanki "asenkron" çalışan bir işlemin sonucu
// olumsuz dönmüş olsun.
// const p = Promise.reject(new Error("Something failed miserably!"));
// p.then(() => {
//   console.log("Promise Done...");
// });
// rejection'ı yakalamak için catch() bloğu kullanılmadı.

/*********************************************************************************
 * Programı çalıştırmadan önce aşağıdaki kısım terminale girilmelidir
 * $env:vidly_jwtPrivateKey="mySecureKey"
 *
 * Mongodb'yi çalışırken durdurmak için yönetici olarak cmd penceresi açılır ve şu komut yazılır:
 * "net stop MongoDB" (eğer çalışan hizmet penceresi açıksa birkaç kere ctrl + c yapılabilir)
 * Tekrar başlatmak için: "net start MongoDB" (mongod işe yarıyor mu bilmiyorum)
 *********************************************************************************/

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined!");
  process.exit(1);
  // 0 ile çıkma demek hata yok, 0 hariç bir değer, "hata" ile çıkma demek. (genelde 1 kullanılıyor)
}

//const connectDatabase = async () => {
async function connectDatabase() {
  try {
    await mongoose.connect(dbPath);
    console.log("→ Successfully connected to the database... ✅");
  } catch (err) {
    // mongodb driver hata üretene kadar belli bir süre geçecek
    console.log("→ Couldn't connect to the database! ❌");
    console.error(err);
  }
}

connectDatabase();

// mongoose
//   .connect("mongodb://localhost/vidly")
//   .then(() => {
//     console.log("Connected to the database...");
//   })
//   .catch((err) => {
//     // mongodb driver hata üretene kadar belli bir süre geçecek
//     console.error("Couldn't connect to the database!", err);
//   });

// Aşağıdaki tanımlamalar MIDDLEWARE fonksiyonlarıdır...
app.use(express.json());
app.use("/api/genres", genres); //ilgili istekleri genres router'ına yönlendirir
app.use("/api/customers", customers);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);

// Error handling middleware fonksiyonu
app.use(error); // fonksiyonu referans geçiyoruz çağırmıyoruz ( error() değil !!! )

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`→ Listening on port ${port}...`));
