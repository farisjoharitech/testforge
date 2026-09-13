import {
  Assessment,
  Dashboard,
  Description,
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
  label: string;
  path: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [

  {
    title:
      'Test Management',

    items: [

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

        /*
         * Task 36.13
         *
         * Dashboard is intentionally
         * unavailable during 36.12.
         */
        disabled:
          true,
      },

    ],
  },

];

function isNavigationItemActive(
  pathname: string,
  path: string,
): boolean {

  /*
   * Exact home/root style matching.
   */
  if (
    path === '/'
  ) {

    return pathname === '/';
  }

  /*
   * Test Plans:
   *
   * /test-plans
   * /test-plans/new
   * /test-plans/TP-001
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
        '/test-scenarios/',
      )
      || pathname.startsWith(
        '/test-cases/',
      )
    );
  }

  /*
   * Automation:
   *
   * /automation
   * /automation/TC-001
   * /automation/TC-001/script
   * /automation/TC-001/execute
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
   * Results:
   *
   * /results
   * /results/EXEC-...
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
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >

      {/*
       * =====================================================
       * BRAND
       * =====================================================
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
       * =====================================================
       * NAVIGATION
       * =====================================================
       */}

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
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
                          disabled={
                            item.disabled
                          }
                          onClick={() => {

                            if (
                              !item.disabled
                            ) {

                              navigate(
                                item.path,
                              );
                            }
                          }}
                          sx={{
                            minHeight: 44,
                            mb: 0.5,
                            borderRadius: 1.5,

                            '&.Mui-selected': {
                              bgcolor:
                                'action.selected',
                            },

                            '&.Mui-selected:hover': {
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

                          {item.disabled && (

                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{
                                ml: 1,
                              }}
                            >
                              Soon
                            </Typography>

                          )}

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

      {/*
       * =====================================================
       * FOOTER
       * =====================================================
       */}

      <Divider />

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