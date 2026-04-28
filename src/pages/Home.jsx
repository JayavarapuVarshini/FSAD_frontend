import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar
} from "@mui/material";
import { School, CheckCircle } from "@mui/icons-material";

const Home = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #10241f 0%, #1f4d45 50%, #d9a441 100%)",
          zIndex: -2
        }}
      />

      {/* LIGHT EFFECT */}
      <Box
        sx={{
          position: "absolute",
          width: "150%",
          height: "150%",
          top: "-20%",
          left: "-20%",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,250,240,0.16), transparent 40%), radial-gradient(circle at 80% 60%, rgba(217,164,65,0.18), transparent 40%)",
          zIndex: -1
        }}
      />

      {/* HEADER */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "transparent" }}>
        <Toolbar sx={{ justifyContent: "space-between", px: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <School sx={{ color: "#f3d48b", mr: 1 }} />
            <Typography
              sx={{
                color: "#fffaf0",
                fontWeight: "bold",
                fontSize: "1.3rem",
                letterSpacing: "0.5px"
              }}
            >
              Edu Feedback 
            </Typography>
          </Box>

          <Box>
            <Button component={Link} to="/login" sx={{ color: "#fffaf0", mr: 2 }}>
              Login
            </Button>

            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: "#f3d48b",
                color: "#16302b",
                borderRadius: "25px",
                px: 3,
                textTransform: "none",
                fontWeight: "bold",
                boxShadow: "0 8px 20px rgba(217,164,65,0.35)",
                "&:hover": {
                  bgcolor: "#d9a441",
                  transform: "translateY(-2px)"
                }
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, md: 10 },
          pt: 12,
          color: "white"
        }}
      >
        {/* LEFT */}
        <Box sx={{ maxWidth: "600px" }}>
          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 2,
              color: "#fffaf0"
            }}
          >
            Transform Feedback 
            <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #f3d48b, #cfe8d5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
            Into Actionable Insights
            </Box>
          </Typography>

          <Typography
            sx={{
              mb: 7,
              opacity: 0.9,
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "rgba(255, 250, 240, 0.9)"
            }}
          >
            Feedback Nexus enables institutions to collect structured feedback,
            analyze academic performance, and enhance teaching effectiveness
            using real-time data-driven insights..
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            width: "650px",
            display: "flex",
            flexDirection: "column",
            gap: 3
          }}
        >
          {[
            "Custom feedback forms for different courses",
            "Secure and anonymous feedback collection",
            "Improves teaching and learning quality",
            "Real-time analytics and insights"
          ].map((text, index) => (
            <Box
              key={index}
              sx={{
                alignSelf: index % 2 === 0 ? "flex-start" : "flex-end",
                width: "80%",
                bgcolor: "rgba(255,250,240,0.14)",
                backdropFilter: "blur(12px)",
                p: 2.5,
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "0.3s",
                border: "1px solid rgba(255,250,240,0.14)",
                boxShadow: "0 10px 30px rgba(19,34,28,0.25)",
                "&:hover": {
                  transform: "translateY(-5px) scale(1.02)",
                  bgcolor: "rgba(255,250,240,0.2)"
                }
              }}
            >
              <CheckCircle sx={{ color: "#f3d48b" }} />
              <Typography sx={{ fontSize: "1.25rem", color: "#fffaf0" }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
