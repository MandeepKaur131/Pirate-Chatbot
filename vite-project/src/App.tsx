import React from 'react'
import './App.css';
import { useState } from 'react'

type Message = {
  text: string,
  sender: 'ai' | 'user'
};

const functionUrl = 'https://pirate-chatbot.baryar25mandeepkaur.workers.dev/';

function App() {
  const [ newInput, setNewInput ] = useState<string>("");
  const [ messages, setMessages ] = useState<Message[]>([
    {
      text: "Sample message",
      sender: "ai"
    },
    {
      text: "Sample message",
      sender: "user"
    }
  ]);

  const newMessage: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setNewInput('');
    const newMessages: Message[] = [...messages, {
      text: newInput,
      sender: 'user'
    }];
    setMessages(newMessages);

    const response = await fetch(functionUrl, {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages })
    });
    setMessages([...newMessages, {
      sender: 'ai',
      text: await response.text()
    }]);
  }

  return <main>
    <h1>Pirate Chat Bot</h1>
    <div className="messages-container">
      {/* Add messages to state and render them here... */}
    {messages.map((message, index) => <p key={index} className={"message " + message.sender}>      
        {message.text}
      </p>)}

    </div>
    <form className="input-form" onSubmit={newMessage}>
      <input
        type="text"
        placeholder="Message"
        value={newInput}
        onChange={(e) => setNewInput(e.target.value)} />
      <input type="submit" value="Send" />
    </form>
  </main>
}

export default App
