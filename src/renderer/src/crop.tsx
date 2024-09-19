import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { MantineProvider } from '@mantine/core';
import { theme } from './theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <MantineProvider theme={theme}>
    <React.StrictMode>Проверка</React.StrictMode>
  </MantineProvider>,
);
