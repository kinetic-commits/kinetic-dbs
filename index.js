const express = require('express');
const app = express();
const expressUploads = require('express-fileupload');
const expressSanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const colors = require('colors');
const path = require('path');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv');
// const map = require('./routes/map');
// const user = require('./routes/user');
// const disco = require('./routes/disco');
// const form74 = require('./routes/form74');
// const order = require('./routes/order');
const Pool = require('pg').Pool;

// .ENV PATH
dotenv.config({ path: 'config/.env' });

// Body Parser Json
app.use(express.json());

// Initializing Middleware
//Middleware
app.use(logger);
app.use(cors());
app.use(cookieParser());
app.use(expressUploads());
app.use(helmet());
app.use(expressSanitizer());

// File paths for all uploads
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res)=>{
   const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_WORD,
    host: process.env.DB_URI,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
  });

  try{
     const { rows } = await pool.query(`SELECT EXISTS(
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${schema}'
      )`);

  res.status(200).json({ rs: rows })
  }catch(err){
      throw err
     console.log(err.message)
  }
})

//Initialize All Created Routes
// app.use('/api/v1/map', map);
// app.use('/api/v1/disco', disco);
// app.use('/api/v1/user', user);
// app.use('/api/v1/form74', form74);
// app.use('/api/v1/order', order);

// Welcome Displays
// app.use(express.static(path.join(__dirname, 'client', 'build')));
// // GET all routes not defined;
// app.get('*', (req, res) =>
//   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
// );

// const p = path.parse(path.join(__dirname, 'context', '_task', 'go.js'));

// Catch All possible error
app.use(errorHandler);

const PORT = process.env.PORT || 5500;

app.listen(PORT, () =>
  console.log(`App running on URL: http://localhost:${PORT}`.yellow.bold)
);
