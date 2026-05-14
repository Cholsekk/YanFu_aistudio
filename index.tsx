
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-datepicker/dist/react-datepicker.css';
import { ConfigProvider } from 'antd';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConfigProvider 
      getPopupContainer={(node) => {
        if (node && node.parentElement) {
          return node.parentElement;
        }
        return document.getElementById('root') || document.body;
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
