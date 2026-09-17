import {
  Box,
} from '@mui/material';

import {
  Outlet,
} from 'react-router-dom';

import AppBreadcrumbs
  from '../navigation/AppBreadcrumbs';

import Sidebar
  from './Sidebar';

export default function AppLayout() {

  return (
    <Box
      sx={{
        minHeight:
          '100vh',

        display:
          'flex',

        bgcolor:
          'background.default',
      }}
    >

      <Sidebar />

      <Box
        component="main"
        sx={{
          flex: 1,

          minWidth: 0,

          p: {
            xs: 2,
            md: 3,
          },
        }}
      >

        <AppBreadcrumbs />

        <Outlet />

      </Box>

    </Box>
  );
}
