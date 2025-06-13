const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Add fs to handle folder creation
const app = express();

const dotenv=require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;
const socketIo = require('socket.io');
// Middleware
app.use(cors());
app.use(bodyParser.json());
const io = socketIo(app.listen(5000, () => {
  console.log('Server running on port 5000');
}), {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"]
  }
});
// 🔗 Socket.io connection

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);  // Create the 'uploads' folder if it doesn't exist
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
})

  

// Define a schema and model
const DataSchema = new mongoose.Schema({
    username: String, 
    email: String,
    password: String,
    file: String,
    userRole:String, 
    uniqcode:String // The file will store the URL of the uploaded image
});

const DataModel = mongoose.model('Data', DataSchema, 'registration');

// Set up Multer storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save uploaded files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
    },
});
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadsParking/'); // Save uploaded files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
    },
});
// Set up file filter (optional, for only allowing image files)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept image files
    } else {
        cb(new Error('Invalid file type'), false); // Reject non-image files
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});
const upload2 = multer({ 
    storage: storage2, 
    fileFilter: fileFilter 
});

// API endpoint to receive data (including file upload)
app.post('/api/data', upload.single('file'), async (req, res) => {
    const { username, email, password,userRole,uniqcode } = req.body;

    // Check if file is uploaded
   const file = req.file ? `https://parkmate-back-3.onrender.com/uploads/${req.file.filename}` : null;


    const newData = new DataModel({
        username,
        email,
        password,
        userRole,
        uniqcode,
        file,  // Save the file URL in the database
    });

    try {
        await newData.save();
        res.status(201).send('Data saved successfully');
    } catch (error) {
        res.status(500).send('Error saving data: ' + error.message);
    }
});

// Serve the 'uploads' folder statically (for accessing images from the browser)
app.use('/uploads', express.static('uploads'));



app.post("/login",(req,res)=>{
    const{email,password,username,userRole}=req.body
     DataModel.findOne({email:email})
     .then(user=>{console.log(user)
       console.log(user);
       if(user)
       {
         if(user.password===password)
         {
             if(user.username===username)
                 {
                  if(user.userRole===userRole)
                  {
                    res.status(200).json({
                        message1: 'Success', // Success message
                        message: user.uniqcode, 
                        message2:user.file,
                   
                      });
                 }
                 else
                 {
                    res.json('Wrong Role') 
                 }
                }
                 else{
                     res.json('Invalid username')
                 }
         }
         else{
           res.json('Invalid password')
         }
         
     }
   else{
     res.json('Invalid email');
   }}
   )})
   app.get('/api3/items', async (req, res) => {
    try {
      const items = await DataModel.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get('/api4/items', async (req, res) => {
    try {
      const items = await ParkModel.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
   const ParkingSchema = new mongoose.Schema({
    ParkingName: String, 
    ParkingArea: String,
   Slots: Number,
   ParkingAddress: String,
   ParkingCode:String,
   ParkingSpaceCode:String,
    file: String,  // The file will store the URL of the uploaded image
});

const ParkModel = mongoose.model('Park', ParkingSchema, 'addparking');

app.post('/api/data1', upload2.single('file'), async (req, res) => {
    const { ParkingName, ParkingArea, Slots,ParkingAddress,ParkingCode,ParkingSpaceCode } = req.body;

    // Check if file is uploaded
   const file = req.file ? `https://parkmate-back-3.onrender.com/uploadsParking/${req.file.filename}` : null;


    const newData = new ParkModel({
        ParkingName, 
        ParkingArea, 
        Slots,
        ParkingAddress,
        ParkingCode,
        ParkingSpaceCode,
        file  // Save the file URL in the database
    });

    try {
        await newData.save();
        res.status(201).send('Data saved successfully');
    } catch (error) {
        res.status(500).send('Error saving data: ' + error.message);
    }
});
app.use('/uploadsParking', express.static('uploadsParking'));

app.get('/api4/items', async (req, res) => {
  try {
    const items = await ParkModel.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api2/items/:message6', async (req, res) => {
    const message=req.params.message6;
    console.log(message);
    try {
      const items = await ParkModel.find({ParkingCode:message});
      if (items) {
        res.json(items);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
 
  app.delete('/delete/:id',(req,res)=>{
    const id=req.params.id;
    ParkModel.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err));
  })

 // Get Parking by ID
app.get("/getUser/:id", async (req, res) => {
    try {
      const parking = await ParkModel.findById(req.params.id);
      if (!parking) {
        return res.status(404).json({ message: "Parking not found" });
      }
      res.status(200).json(parking);
    } catch (error) {
      res.status(500).json({ message: "Error fetching parking", error });
    }
  });
  
  // Update Parking by ID
  app.put("/Update/:id", upload.single("file"), async (req, res) => {
    try {
      const { ParkingName, ParkingArea, Slots, ParkingAddress } = req.body;
      
      // If a new file is uploaded, use it; otherwise, keep the existing file (fetch it from the database)
      let file;
      if (req.file) {
       const file = `https://parkmate-back-3.onrender.com/uploads/${req.file.filename}`;
 // If new file is uploaded, use the new file
      } else {
        // Fetch the current file path from the database before update
        const currentParking = await ParkModel.findById(req.params.id);
        if (currentParking) {
          file = currentParking.file;  // Keep the existing file path
        } else {
          return res.status(404).json({ message: "Parking not found" });
        }
      }
  
      const updateData = {
        ParkingName,
        ParkingArea,
        Slots,
        ParkingAddress,
        file,  // This will either be the new file or the old file
      };
  
      // Find and update the parking entry by ID
      const updatedParking = await ParkModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
      if (!updatedParking) {
        return res.status(404).json({ message: "Parking not found" });
      }
  
      res.status(200).json({ message: "Parking updated successfully", updatedParking });
    } catch (error) {
      console.error("Error during update: ", error);  // Log error to console for debugging
      res.status(500).json({ message: "Error updating parking", error });
    }
  });
  io.on("connection", (socket) => {
    // console.log("New client connected:", socket.id);
   
     socket.on("newBooking", (data) => {
      // console.log("Received new offer from Parker:", data);
       // Broadcast to all connected customers
       io.emit("newBooking", {data});
     });
   
     socket.on("disconnect", (reason) => {
      // console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
     });
   });
   const bookingSchema = new mongoose.Schema({
    username: { type: String, required: true },
    bookingTime: { type: String, required: true },
    email: { type: String, required: true },
    SlotNo: { type: Number, required: true },
    VehicleNumber: { type: String, required: true },
    CustomerCode: { type: String, required: true },
    ParkingCode: { type: String, required: true },
    ParkingArea: { type: String, required: true },
    ParkingName: { type: String, required: true },
    ParkingSpaceCode: { type: String, required: true },
  });
  
  // ✅ Add compound unique index to prevent double bookings for the same slot
  bookingSchema.index({ ParkingSpaceCode: 1, SlotNo: 1 }, { unique: true });
  
  const Booking = mongoose.model('Booking', bookingSchema, 'booking_info');
  
  // Route to handle booking form submission
  app.post('/api/book', async (req, res) => {
    const {
      username,
      bookingTime,
      email,
      CustomerCode,
      SlotNo,
     VehicleNumber,
      ParkingCode,
      ParkingArea,
      ParkingName,
      ParkingSpaceCode
    } = req.body;
  
    // Simple validation
    if (!username || !bookingTime || !email || !VehicleNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Check if the slot is already booked (pre-check, not strictly required if unique index is enforced)
      const existingBooking = await Booking.findOne({ ParkingSpaceCode, SlotNo });
  
      if (existingBooking) {
        // Slot already booked, return a specific message
        return res.status(409).json({ message: 'This slot is already booked by another user.' });
      }
  
      // If the slot is available, proceed with booking
      const newBooking = new Booking({
        username,
        bookingTime,
        email,
        CustomerCode,
        SlotNo,
        VehicleNumber,
        ParkingCode,
        ParkingArea,
        ParkingName,
        ParkingSpaceCode,
      });
  
      // Save the booking to MongoDB
      await newBooking.save();
  
      // Emit event for new booking
      io.emit("newBooking", { ParkingSpaceCode, ParkingCode });
  
      res.status(200).json({ message: 'Booking successful!', booking: newBooking });
  
    } catch (error) {
      // ✅ Handle race condition: if another booking sneaked in
      if (error.code === 11000) {
        return res.status(409).json({ message: 'This slot is already booked by another user.' });
      }
  
      console.error(error);
      res.status(500).json({ message: 'There was an error with the booking. Please try again.' });
    }
  });
  
  
  
  app.get('/api5/items', async (req, res) => {
    try {
      const { ParkingCode } = req.query;  // Get ParkingCode from query parameters
 
      // If ParkingCode is provided, filter bookings based on it
      const query = ParkingCode ? { ParkingCode } : {};  // Only filter by ParkingCode if it's provided
  
      // Fetch items from the database, optionally filtered by ParkingCode
      const items = await Booking.find(query);
  
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get('/Slot/:ParkingSpaceCode', async (req, res) => {
    const code=req.params.ParkingSpaceCode;
    try {
      const items = await Booking.find({ParkingSpaceCode:code});
      if (items) {
        res.json(items);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get('/View/:message2', async (req, res) => {
    const message=req.params.message2;
    try {
      const items = await Booking.find({CustomerCode:message});
      if (items) {
        res.json(items);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get('/ViewBooking', async (req, res) => {
    try {
      const items = await Booking.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  // Route to handle booking form submission
  const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    feedback: String,
    Time: String,
  });
  
  // Create a model from the schema
  const Feedback = mongoose.model("Feedback", feedbackSchema,'feedback_info');
  
  // POST route to handle feedback submission
  app.post("/api/feed", (req, res) => {
    const { name, email, feedback, Time } = req.body;
  
    // Create a new feedback document
    const newFeedback = new Feedback({
      name,
      email,
      feedback,
      Time,
    });
  
    // Save the feedback to the database
    newFeedback.save()
      .then(() => {
        res.status(200).json({ message: "Feedback received successfully!" });
      })
      .catch((err) => {
        console.error("Error saving feedback:", err);
        res.status(500).json({ message: "Error saving feedback." });
      });
  });

  app.get('/ViewFeedback', async (req, res) => {
    try {
      const items = await Feedback.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const offerSchema = new mongoose.Schema({
    offerText: { type: String, required: true },
    parkingCode: { type: String }, // Field to filter offers
    createdAt: { type: Date, default: Date.now },
    Parkingname: { type: String },
    expiryDate:{type:Date},
  });
  
  const Offer = mongoose.model('Offer', offerSchema);
  
  // Get offers based on message6
  app.get('/api/offers/:message6', async (req, res) => {
    try {
      const { message6 } = req.params;
      const offers = await Offer.find({ parkingCode: message6 }).sort({ createdAt: -1 });
      res.json(offers);
    } catch (err) {
      res.status(500).json({ error: 'Server Error' });
    }
  });

  app.post('/api/offers', async (req, res) => {
    try {
      const { offerText, parkingCode,Parkingname,expiryDate } = req.body;
      const newOffer = new Offer({ offerText, parkingCode,Parkingname ,expiryDate});
      await newOffer.save();
  
     
  
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add offer' });
    }
  });
 
  
  
  // Get all offers
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});
app.delete('/api/offers/:id', async (req, res) => {
  try {
    const offerId = req.params.id;
    
    // Find and delete the offer by its ID
    const offer = await Offer.findByIdAndDelete(offerId);
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer deleted successfully', offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


const incomeSchema = new mongoose.Schema({
  parkingCode: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  incomeList: {
    type: [Number],
    required: true
  },
  totalIncome: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Income = mongoose.model('Income', incomeSchema);

// POST endpoint to save income data
app.post('/save-income', async (req, res) => {
  const { parkingCode, incomeList, totalIncome } = req.body;

  if (!parkingCode || !incomeList || typeof totalIncome !== 'number') {
    return res.status(400).json({ message: 'Missing or invalid fields' });
  }

  const now = new Date();
  const date = now.toLocaleDateString();
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });

  try {
    const newIncome = new Income({
      parkingCode,
      day,
      date,
      incomeList,
      totalIncome
    });

    const savedIncome = await newIncome.save();
    res.status(200).json({ message: 'Income saved successfully', data: savedIncome });
  } catch (err) {
    console.error('Error saving income:', err);
    res.status(500).json({ message: 'Server error while saving income' });
  }
});

// GET endpoint to fetch all saved incomes
app.get('/all-income', async (req, res) => {
  try {
    const { parkingCode } = req.query;

    if (!parkingCode) {
      return res.status(400).json({ message: 'Missing parkingCode in request' });
    }

    const incomes = await Income.find({ parkingCode }).lean();

    res.status(200).json(incomes);
  } catch (err) {
    console.error('Error fetching incomes:', err);
    res.status(500).json({ message: 'Failed to fetch records' });
  }
});


app.delete('/Slot/:ParkingSpaceCode/delete/:slotNumber', async (req, res) => {
  const { ParkingSpaceCode, slotNumber } = req.params;
console.log(ParkingSpaceCode)
  try {
    // Find and delete the slot by ParkingSpaceCode and SlotNo
    const result = await Booking.findOneAndDelete({
      ParkingSpaceCode:ParkingSpaceCode,
      SlotNo: slotNumber,
    });

    // If a slot was found and deleted
    if (result) {
      return res.status(200).send('Slot successfully unbooked');
    } else {
      // If no slot was found with that code and slot number
      return res.status(404).send('Slot not found or already unbooked');
    }
  } catch (error) {
    console.error('Error deleting slot:', error);
    return res.status(500).send('Error deleting slot');
  }
});

app.get('/apiprof/items/:message6', async (req, res) => {
  const message=req.params.message6;
  console.log(message);
  try {
    const items = await DataModel.find({uniqcode:message});
    if (items) {
      res.json(items);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/apiprof/items/:message6', async (req, res) => {
  const message = req.params.message6;
  try {
    const updatedItem = await DataModel.findOneAndUpdate(
      { uniqcode: message },
      { $set: req.body },
      { new: true }
    );

    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

 
app.delete('/delete1/:id',(req,res)=>{
  const id=req.params.id;
  Booking.findByIdAndDelete({_id:id})
  .then(res => res.json(res))
  .catch(err => res.json(err));
})

// Fix: Use correct param name
app.get('/apidata/items/:ParkingSpaceCode', async (req, res) => {
  const ParkingSpaceCode = req.params.ParkingSpaceCode;

  try {
    const items = await Booking.find({ ParkingSpaceCode:ParkingSpaceCode });
    if (items.length > 0) {
      res.json(items);
    } else {
      res.status(404).json({ message: 'No entries found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
