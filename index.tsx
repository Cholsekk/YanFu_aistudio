
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
      getPopupContainer={() => document.getElementById('root') as HTMLElement || document.body}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
