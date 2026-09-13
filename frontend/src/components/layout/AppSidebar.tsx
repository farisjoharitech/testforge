import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon
  from "@mui/icons-material/DashboardOutlined";

import AssignmentOutlinedIcon
  from "@mui/icons-material/AssignmentOutlined";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({
  onNavigate,
}: AppSidebarProps) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const navigateTo =
    (path: string) => {
      navigate(path);
      onNavigate?.();
    };

  const testPlansSelected =
    location.pathname ===
      "/test-plans" ||
    location.pathname.startsWith(
      "/test-plans/",
    ) ||
    location.pathname.startsWith(
      "/test-cases/",
    );

  const dashboardSelected =
    location.pathname.startsWith(
      "/dashboard",
    );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
        >
          TestForge
        </Typography>
      </Toolbar>

      <Divider />

      <List
        sx={{
          px: 1,
          py: 2,
        }}
      >
        <ListItemButton
          selected={
            testPlansSelected
          }
          onClick={() =>
            navigateTo(
              "/test-plans",
            )
          }
          sx={{
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <ListItemIcon>
            <AssignmentOutlinedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Test Plans"
          />
        </ListItemButton>

        <ListItemButton
          selected={
            dashboardSelected
          }
          onClick={() =>
            navigateTo(
              "/dashboard",
            )
          }
          sx={{
            borderRadius: 1,
          }}
        >
          <ListItemIcon>
            <DashboardOutlinedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Dashboard"
          />
        </ListItemButton>
      </List>
    </Box>
  );
}