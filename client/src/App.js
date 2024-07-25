import './App.css';
import {Route} from 'react-router-dom';
import HomePage from './Pages/homepage';
import ChatPage from './Pages/chatpage';

function App() {
  return (
    <div className="App">
      <Route path = '/' component = {HomePage} exact/>
      <Route path = '/chats' component= {ChatPage} ex/>
    </div>
  );
}

export default App;
