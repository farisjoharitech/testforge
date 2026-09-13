import {
  AddTask,
  Api,
  Assessment,
  Dashboard,
  FactCheck,
  PlayArrow,
  PlaylistAddCheck,
  Rule,
  Science,
} from '@mui/icons-material';

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  width: number;
}

const menuItems = [
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    label: 'Test Plans',
    icon: <FactCheck />,
    path: '/test-plans',
  },
  {
    label: 'Requirements',
    icon: <Rule />,
    path: '/requirements',
  },
  {
    label: 'Test Scenarios',
    icon: <Science />,
    path: '/test-scenarios',
  },
  {
    label: 'Test Cases',
    icon: <PlaylistAddCheck />,
    path: '/test-cases',
  },
  {
    label: 'Automation',
    icon: <AddTask />,
    path: '/automation',
  },
  {
    label: 'API Testing',
    icon: <Api />,
    path: '/api-testing',
  },
  {
    label: 'Executions',
    icon: <PlayArrow />,
    path: '/executions',
  },
  {
    label: 'Reports',
    icon: <Assessment />,
    path: '/reports',
  },
];

export default function Sidebar({ width }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#111827',
        color: 'white',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
          }}
        >
          TestForge
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: '#9ca3af',
          }}
        >
          Test Management Platform
        </Typography>
      </Box>

      <Divider
        sx={{
          borderColor: '#374151',
        }}
      />

      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const selected =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <ListItemButton
              key={item.label}
              selected={selected}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,

                color: selected ? 'white' : '#d1d5db',

                '&.Mui-selected': {
                  backgroundColor: '#2563eb',
                },

                '&.Mui-selected:hover': {
                  backgroundColor: '#1d4ed8',
                },

                '&:hover': {
                  backgroundColor: '#1f2937',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}