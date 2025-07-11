import { createRoot } from 'react-dom/client'
import {Provider} from 'react-redux'
import store from './store'
import App from './App'
import './index.css'
import './services/request_interceptor';
import './services/response_interceptor';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)