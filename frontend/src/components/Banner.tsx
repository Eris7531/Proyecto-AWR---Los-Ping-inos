import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import { useRoomStore } from "../stores/roomStore";
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import {useState} from "react";
import type { User } from "../types/user";
import {
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";

interface BannerProps {
    user: User | null;
    onLogout: () => void;
}


export default function PrimarySearchAppBar({user, onLogout}: BannerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);

  const currentRoom = useRoomStore(
    (state) => state.currentRoom
  );
  
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const navigate = useNavigate();
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >

      <MenuItem
        onClick={() => {
        handleMenuClose();
        if (user) navigate(`/usuarios/${user.id}`);
      }}
      >
        Mi cuenta
      </MenuItem>


      <MenuItem onClick={onLogout}>
        Cerrar sesión
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
        {user && (
            <>
                <MenuItem>
                    <IconButton 
                        size="large" 
                        aria-label="mensajes" 
                        color="inherit"
                    >
                    <Badge badgeContent={0} color="error">
                        <MailIcon />
                    </Badge>
                    </IconButton>
                    <p>Mensajes</p>
                </MenuItem>
                <MenuItem>
                    <IconButton
                    size="large"
                    aria-label="notificaciones"
                    color="inherit"
                    >
                    <Badge badgeContent={0} color="error">
                        <NotificationsIcon />
                    </Badge>
                    </IconButton>
                    <p>Notificaciones</p>
                </MenuItem>
            </>
        )}
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>{user ? user.username : "Iniciar sesión"}</p>
      </MenuItem>
    </Menu>
  );

  return (
    <>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            aria-label="Ping-Gamers, volver al inicio"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": { opacity: 0.85 },
            }}
          >
            Ping-Gamers
          </Typography>
          {currentRoom && (
            <Box
              onClick={() => navigate(`/equipos/${currentRoom.id}`)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: 3,
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                },
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  backgroundColor: "#4ade80",
                }}
              />

              <Typography variant="body2" sx={{ color: "inherit" }}>
                Estás en: <strong>{currentRoom.name}</strong>
              </Typography>
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user && (
                <>
                    <IconButton 
                    size="large" 
                    aria-label="mensajes" 
                    color="inherit">
                    <Badge badgeContent={0} color="error">
                        <MailIcon />
                    </Badge>
                    </IconButton>
                    <IconButton
                        size="large"
                        aria-label="notificaciones"
                        color="inherit"
                    >
                    <Badge badgeContent={0} color="error">
                        <NotificationsIcon />
                    </Badge>
                    </IconButton>
                </>
            )}

            <IconButton
            size="large"
            edge="end"
            aria-label="cuenta del usuario"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            >
            <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
    </>
  );
}