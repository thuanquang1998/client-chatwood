
import Chatbot from './components/Chatbot'
import Chat from './components/Chat'
import FAQBot from './components/FAQBot'

function App() {
  return (
    <div>
      <div className="m-10">
        <FAQBot/>
      </div>
      <Chatbot/>
      {/* <Chat/> */}
    </div>
      
  );
}

export default App;