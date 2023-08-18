import './index.css';

import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { Auth0ProviderWithNavigate } from './components/Auth0/auth0-provider-with-navigate.tsx';
import { client } from './graphql/client.ts';
import { store } from './store.ts';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <Auth0ProviderWithNavigate>
      <ApolloProvider client={client}>
        <Provider store={store}>
          <App />
        </Provider>
      </ApolloProvider>
    </Auth0ProviderWithNavigate>
  </BrowserRouter>
);
