import {
  Box,
  Drawer,
  Toolbar,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import {
  AppHeader,
} from "./AppHeader";

import {
  AppSidebar,
} from "./AppSidebar";

const DRAWER_WIDTH =
  240;

export function AppShell() {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const toggleMobileDrawer =
    () => {
      setMobileOpen(
        (current) =>
          !current,
      );
    };

  const closeMobileDrawer =
    () => {
      setMobileOpen(false);
    };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor:
          "background.default",
      }}
    >
      <AppHeader
        onMenuClick={
          toggleMobileDrawer
        }
      />

      <Box
        component="nav"
        sx={{
          width: {
            md: DRAWER_WIDTH,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={
            closeMobileDrawer
          }
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            "& .MuiDrawer-paper":
              {
                width:
                  DRAWER_WIDTH,
              },
          }}
        >
          <AppSidebar
            onNavigate={
              closeMobileDrawer
            }
          />
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            "& .MuiDrawer-paper":
              {
                width:
                  DRAWER_WIDTH,
                boxSizing:
                  "border-box",
              },
          }}
        >
          <AppSidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          minWidth: 0,
        }}
      >
        <Toolbar />

        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            maxWidth: 1600,
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}