import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const userName = localStorage.getItem("username");
 // const token = localStorage.getItem("token");
  

  const handleLogout = () => {
    //localStorage.clear();
    //window.location.reload();
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("balance"); 
    history.push("/"); // redirect to home
    window.location.reload(); // optional, depending on test expectation
  };

  const handleExplore = () => {
    history.push("/");
  };
    return (
      //<Box className="header">/**/
      <Box className="header">
     <Box className="header-title" >
            <img src="logo_light.svg" 
            alt="QKart-icon" 
            onClick={handleExplore}/>
        </Box>
         
        {children}
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={handleExplore}
        >
          Back to explore
        </Button>
        ): userName ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar alt={userName} src="avatar.png" />
            <p className="userName-text">{userName}</p>
            <Button variant="text" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button variant="text" onClick={() => history.push("/login")}>
              Login
            </Button>
            <Button variant="contained" onClick={() => history.push("/register")}>
              Register
            </Button>
          </Stack>
        )}
          </Box>
    );
};

export default Header;
