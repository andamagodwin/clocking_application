const express = require("express");
const moment = require("moment");
const router = express.Router();
const User=require("../models/user");

const bcrypt = require("bcrypt");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");
const getCurrentTime = require("../middleware/timeUtil")
const Timelog = require("../models/timelogs");



const handleErrors = (err) => {
    const errors = { name: "", email: "", password: "" };
    // console.log(err.message);

    if (err.code === 11000) {
      errors.email = "Email already exists";
      return errors;
    }


    if (err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
            // console.log(properties);
        })
    }
    
    return errors;
      
}

router.get("/admin/edit-user/:id",isAuthenticated, async (req, res) => {
    // const userId=req.session.user;
    // const user = await User.findById(userId);
    const id = req.params.id;
    const userEdit = await User.findById(id);
    res.render("edit-user", {
      title: "Edit User",
      user: req.session.user,
      id: id,
      name: userEdit.name,
      email: userEdit.email,
      password: userEdit.password,
      role: userEdit.role,
      type:"password"
    });
})
router.post("/admin/edit-user/:id", async (req, res) => {
    
    // const userId=req.session.user;
    // const user = await User.findById(userId);
    const id = req.params.id;
   

    const { name, email, password, role } = req.body;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const userEdit = await User.findByIdAndUpdate(id);
      userEdit.name = name;
      userEdit.email = email;
      userEdit.password = password;
      userEdit.role = role;
      userEdit.save();
      res.redirect("/admin/users");
      // res.status(201).json(user);
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json(errors);
      console.log(errors);
    }




    // res.render("edit-user", {
    //   title: "Edit User",
    //   user: req.session.user,
    //   name: userEdit.name,
    //   email: userEdit.email,
    //   password: "(Unchanged)",
    //   role: userEdit.role,
    //   type:"text"
    // });
})


router.get("/admin/signin", (req, res) => {
    res.redirect("/signin");
})

router.get("/admin/report",isAuthenticated, async (req, res) => {
    const users = await User.find();
    const logs = await Timelog.find();
    res.render("report", {
        title: "report",
        users:users,
        user: req.session.user,
        logs: logs,
        moment:moment,
    });
})
router.get("/admin/users",isAuthenticated, async (req, res) => {
    const index = 1;
    const users = await User.find();
    const logs = await Timelog.find();
    res.render("users", {
        title: "users",
        users:users,
        user: req.session.user,
        moment:moment,
        index:index,
    });
})


router.post("/timelog/log-time", async (req, res) => {
    const { userId } = req.body;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentOwner = await User.findByIdAndUpdate(userId);
    
  try {
      let timelog = await Timelog.findOne({ owner: userId }).sort({ timeIn: -1 });
      if (timelog) {
          if (!timelog.timeOut) {
              let update = await Timelog.findByIdAndUpdate(timelog._id);
              update.timeOut = now;
              await update.save();
            //   res.status(201).json(update);
              res.json({status:"timeOut",time:update.timeOut})
          }else{
            let newLog = await new Timelog({
              date: today,
              timeIn: now,
              timeOut: null,
              owner: userId,
            });
              await newLog.save();
              currentOwner.timelogs.push(newLog._id);
              await currentOwner.save();
            //   console.log(currentOwner);
            //   res.status(201).json(newLog);
              res.json({ status: "timeIn", time: newLog.timeIn });
          }
        
      } else {
          let newLog = await new Timelog({ date: today, timeIn: now, timeOut:null , owner: userId });
          await newLog.save();
          currentOwner.timelogs.push(newLog._id)
          await currentOwner.save();
        //   console.log(currentOwner);
        //   res.status(201).json(newLog)
          res.json({ status: "timeIn", time: newLog.timeIn });
      }
      
     
    
  } catch (err) {
    console.log(err);
  }
});



router.get("/dashboard",isAuthenticated, (req, res) => {
  res.render("dashboard", { title: "Dashboard", user: req.session.user,userId:req.session.user._id });
});

router.get("/admin/dashboard", isAdmin, (req, res) => {
    const currentTime = getCurrentTime();
  res.render("adminDashboard", {
    title: "Admin",
    user: req.session.user,
    userId: req.session.user._id,
  });
});


router.get("/", (req, res) => {
    res.redirect("/signin")
})

router.get("/signin", (req, res) => {
    res.render("signin", { emailError: "", passwordError: "" });
})
router.post("/signin", async (req, res) => {

    const { email, password} = req.body;
    const user = await User.findOne({ email });
    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.user = user;
            if (user.role === "admin") {
                res.redirect("/admin/dashboard");
            } else {
                res.redirect("/dashboard");
            }
        
        } else {
            return res.render("signin", {
              emailError: "",
              passwordError: "wrong Password",
            });
        }
       
    } else {
        return res.render("signin", { emailError: "invalid username",passwordError:"" });
    }
})
router.get("/adduser", (req, res) => {
    res.render("adduser");
})
router.post("/adduser", async (req, res) => {
    const { name, email, password, role } = req.body;
    

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.redirect("/admin/users")
        // res.status(201).json(user);
        
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json(errors);
        console.log(errors)
    }
})

router.get("/admin/delete-user/:id", async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.redirect("/admin/users");
})

router.get("/report-user", isAuthenticated, async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  const logs = await Timelog.find({ owner: userId });
  res.render("report-user", {
    title: "report",
    user: req.session.user,
    logs: logs,
    moment: moment,
  });
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/signin");
})



module.exports = router;