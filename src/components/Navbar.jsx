import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

const Navbar = ({ hideProfileButton = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    user = null;
  }

  const displayName = user?.fullName || user?.name || "Admin User";
  const displayEmail = user?.email || "admin@gmail.com";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <AppBar position="static" sx={{ background: "#16302b", boxShadow: "0 10px 28px rgba(10, 33, 28, 0.28)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#f7f1e3", letterSpacing: 0.3 }}>
          Edu Feedback
        </Typography>

        {!hideProfileButton && (
          <Box>
            <Tooltip title="Profile">
              <IconButton onClick={handleProfileClick}>
                <Avatar sx={{ bgcolor: "#d9a441", color: "#16302b", fontWeight: 700 }}>{avatarLetter}</Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 180,
                  backgroundColor: "#fffaf0",
                  border: "1px solid #e8dcc2",
                },
              }}
            >
              <MenuItem disabled>{displayName}</MenuItem>
              <MenuItem disabled>{displayEmail}</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
