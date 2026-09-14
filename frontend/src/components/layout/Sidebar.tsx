import type {
  ReactNode,
} from 'react';

import {
  Assessment,
  Dashboard,
  Description,
  Folder,
  Science,
} from '@mui/icons-material';

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

interface NavigationItem {
  label:
      string;

  path:
      string;

  icon:
      ReactNode;
}

interface NavigationSection {
  title:
      string;

  items:
      NavigationItem[];
}

const navigationSections:
    NavigationSection[] = [

  {
    title:
        'Test Management',

    items: [

      {
        label:
            'Projects',

        path:
            '/projects',

        icon:
            <Folder />,
      },

      {
        label:
            'Test Plans',

        path:
            '/test-plans',

        icon:
            <Description />,
      },

    ],
  },

  {
    title:
        'Automation',

    items: [

      {
        label:
            'Automation',

        path:
            '/automation',

        icon:
            <Science />,
      },

      {
        label:
            'Results',

        path:
            '/results',

        icon:
            <Assessment />,
      },

    ],
  },

  {
    title:
        'Reporting',

    items: [

      {
        label:
            'Dashboard',

        path:
            '/dashboard',

        icon:
            <Dashboard />,
      },

    ],
  },

];

function isNavigationItemActive(
    pathname: string,
    path: string,
): boolean {

  /*
   * Project hierarchy.
   */
  if (
      path === '/projects'
  ) {

    return (
        pathname === '/projects'

        || pathname.startsWith(
            '/projects/',
        )
    );
  }

  /*
   * Test Management hierarchy:
   *
   * /test-plans
   * /test-plans/new
   * /test-plans/:testPlanId
   * /requirements/:requirementId
   * /scenarios/:scenarioId
   * /test-cases/:testCaseId
   */
  if (
      path === '/test-plans'
  ) {

    return (
        pathname === '/test-plans'

        || pathname.startsWith(
            '/test-plans/',
        )

        || pathname.startsWith(
            '/requirements/',
        )

        || pathname.startsWith(
            '/scenarios/',
        )

        || pathname.startsWith(
            '/test-cases/',
        )
    );
  }

  /*
   * Automation hierarchy.
   */
  if (
      path === '/automation'
  ) {

    return (
        pathname === '/automation'

        || pathname.startsWith(
            '/automation/',
        )
    );
  }

  /*
   * Results hierarchy.
   */
  if (
      path === '/results'
  ) {

    return (
        pathname === '/results'

        || pathname.startsWith(
            '/results/',
        )
    );
  }

  /*
   * Dashboard hierarchy.
   */
  if (
      path === '/dashboard'
  ) {

    return (
        pathname === '/dashboard'

        || pathname.startsWith(
            '/dashboard/',
        )
    );
  }

  return (
      pathname === path

      || pathname.startsWith(
          `${path}/`,
      )
  );
}

export default function Sidebar() {

  const navigate =
      useNavigate();

  const location =
      useLocation();

  return (
      <Box
          component="aside"
          sx={{
            width: 260,

            minWidth: 260,

            height: '100vh',

            position:
                'sticky',

            top: 0,

            display:
                'flex',

            flexDirection:
                'column',

            borderRight:
                '1px solid',

            borderColor:
                'divider',

            bgcolor:
                'background.paper',
          }}
      >

        {/*
       * ===============================================
       * BRAND
       * ===============================================
       */}

        <Box
            sx={{
              px: 3,
              py: 2.5,
            }}
        >
          <Stack
              spacing={0.25}
          >
            <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  letterSpacing:
                      '-0.04em',
                }}
            >
              TestForge
            </Typography>

            <Typography
                variant="caption"
                color="text.secondary"
            >
              Test Management Platform
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {/*
       * ===============================================
       * NAVIGATION
       * ===============================================
       */}

        <Box
            sx={{
              flex: 1,

              overflowY:
                  'auto',

              px: 1.5,

              py: 2,
            }}
        >
          <Stack
              spacing={2.5}
          >
            {navigationSections.map(
                section => (

                    <Box
                        key={
                          section.title
                        }
                    >
                      <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{
                            display:
                                'block',

                            px: 1.5,

                            mb: 0.5,

                            fontSize: 11,

                            fontWeight: 700,

                            letterSpacing:
                                '0.08em',
                          }}
                      >
                        {
                          section.title
                        }
                      </Typography>

                      <List
                          disablePadding
                      >
                        {section.items.map(
                            item => {

                              const active =
                                  isNavigationItemActive(
                                      location.pathname,
                                      item.path,
                                  );

                              return (
                                  <ListItemButton
                                      key={
                                        item.path
                                      }
                                      selected={
                                        active
                                      }
                                      onClick={() =>
                                          navigate(
                                              item.path,
                                          )
                                      }
                                      sx={{
                                        minHeight: 44,

                                        mb: 0.5,

                                        borderRadius:
                                            1.5,

                                        '&.Mui-selected':
                                            {
                                              bgcolor:
                                                  'action.selected',
                                            },

                                        '&.Mui-selected:hover':
                                            {
                                              bgcolor:
                                                  'action.selected',
                                            },
                                      }}
                                  >
                                    <ListItemIcon
                                        sx={{
                                          minWidth: 38,

                                          color:
                                              active
                                                  ? 'primary.main'
                                                  : 'text.secondary',
                                        }}
                                    >
                                      {
                                        item.icon
                                      }
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                          item.label
                                        }
                                        primaryTypographyProps={{
                                          fontSize: 14,

                                          fontWeight:
                                              active
                                                  ? 700
                                                  : 500,
                                        }}
                                    />
                                  </ListItemButton>
                              );
                            },
                        )}
                      </List>
                    </Box>

                ),
            )}
          </Stack>
        </Box>

        <Divider />

        {/*
       * ===============================================
       * FOOTER
       * ===============================================
       */}

        <Box
            sx={{
              px: 3,
              py: 2,
            }}
        >
          <Typography
              variant="caption"
              color="text.secondary"
          >
            TestForge POC
          </Typography>

          <Typography
              display="block"
              variant="caption"
              color="text.disabled"
          >
            Playwright + Java
          </Typography>
        </Box>

      </Box>
  );
}